/**
 * OWNER: Person A (Circuit Engine)
 *
 * Turns placements into a graph the solver can walk:
 *   nodes = nets (electrically identical points)
 *   edges = components (things with a voltage across them)
 *
 * Wires are NOT edges — they already merged two nets into one back in
 * netlist.js, which is exactly what a wire does physically.
 */

import { getComponent } from '../content/components.js';

/** @typedef {import('../shared/types.js').Placement} Placement */

/** An LED is not a perfect conductor. Small, but it keeps I finite. */
export const LED_INTERNAL_OHMS = 10;

/** A closed mechanical switch, and the copper in a jumper wire. */
export const IDEAL_OHMS = 0;

/**
 * @typedef {object} Edge
 * @property {string} key       Unique per edge, NOT per placement — a
 *                              potentiometer is one placement but two edges.
 * @property {Placement} placement
 * @property {import('../shared/types.js').ComponentType} type
 * @property {number} a          net id at pins[0]
 * @property {number} b          net id at pins[1]
 * @property {boolean} conducts  false means the edge is not traversable at all
 * @property {boolean} directional  true for an LED: only a -> b
 * @property {number} ohms
 * @property {number} forwardVolts  voltage this part drops before Ohm's law
 * @property {number} volts         batteries only
 * @property {'a-wiper'|'wiper-b'} [segment]  potentiometer halves only
 */

/**
 * @param {Placement[]} placements
 * @param {(hole: string) => number} netOf
 * @param {'asPlaced'|'forceOpen'|'forceClosed'} switchMode
 * @returns {Edge[]}
 */
export function buildGraph(placements, netOf, switchMode) {
  /** @type {Edge[]} */
  const edges = [];

  for (const placement of placements) {
    if (placement.type === 'wire') continue;

    const electrical = getComponent(placement.type).electrical ?? {};

    /*
     * A potentiometer is one part but two resistances, split at the wiper.
     * Both go in: whichever pins the player actually wired decide which half
     * (or halves) the current ends up crossing, exactly as on a real one.
     */
    if (placement.type === 'potentiometer') {
      const [aHole, wiperHole, bHole] = placement.holes;
      const { lower, upper } = potentiometerTrack(placement, electrical);
      const half = (name, from, to, ohms) => {
        const a = netOf(from);
        const b = netOf(to);
        // Either pin unplugged, or both in one strip — a shorted-out half is
        // not a resistance any more, it is a piece of wire.
        if (a === -1 || b === -1 || a === b) return;
        edges.push({
          key: `${placement.id}:${name}`,
          placement,
          type: 'potentiometer',
          segment: name,
          a,
          b,
          conducts: true,
          directional: false,
          ohms,
          forwardVolts: 0,
          volts: 0,
        });
      };
      half('a-wiper', aHole, wiperHole, lower);
      half('wiper-b', wiperHole, bHole, upper);
      continue;
    }

    const [first, second] = placement.holes;
    if (!first || !second) continue;

    const a = netOf(first);
    const b = netOf(second);
    if (a === -1 || b === -1) continue;

    edges.push({
      key: placement.id,
      placement,
      type: placement.type,
      a,
      b,
      conducts: isConducting(placement, switchMode),
      directional: placement.type === 'led',
      ohms: resistanceOf(placement, electrical),
      forwardVolts: placement.type === 'led' ? (electrical.forwardVolts ?? 0) : 0,
      volts: electrical.volts ?? 0,
    });
  }

  return edges;
}

/**
 * A switch is the only component whose conductivity the player controls.
 * Everything else always conducts (subject to direction, for an LED).
 *
 * @param {Placement} placement
 * @param {'asPlaced'|'forceOpen'|'forceClosed'} switchMode
 */
function isConducting(placement, switchMode) {
  if (placement.type !== 'switch') return true;
  if (switchMode === 'forceOpen') return false;
  if (switchMode === 'forceClosed') return true;
  return Boolean(placement.state?.closed);
}

/** @param {Placement} placement */
function resistanceOf(placement, electrical) {
  if (placement.type === 'resistor') return electrical.ohms ?? 0;
  if (placement.type === 'led') return LED_INTERNAL_OHMS;
  return IDEAL_OHMS; // switch, battery
}

/**
 * Where the knob has left the wiper, as two resistances that always add up to
 * the whole track. Turned fully "bright" (turn 0) the wiper sits against end A,
 * so the A-to-wiper half is nothing at all and the whole track is on the other
 * side of it.
 *
 * @param {Placement} placement
 * @returns {{ lower: number, upper: number, total: number }}
 *   lower = end A to wiper, upper = wiper to end B
 */
export function potentiometerTrack(placement, electrical) {
  const turn = Math.min(1, Math.max(0, placement.state?.turn ?? 0));
  const total = electrical.trackOhms ?? 0;
  const lower = turn * total;
  return { lower, upper: total - lower, total };
}

/**
 * What the knob is worth on its own: the A-to-wiper half, which is the one a
 * dimmer puts in the path. Used for the read-out before the part is wired into
 * anything, where there is no path to measure.
 *
 * @param {Placement} placement
 */
export function potentiometerOhms(placement, electrical) {
  return potentiometerTrack(placement, electrical).lower;
}

/**
 * Depth-first search for a path of components from one net to another.
 *
 * Series-only by design: we return the FIRST path found, not all of them.
 * That is the agreed v1 scope (see docs/ARCHITECTURE.md).
 *
 * @param {Edge[]} edges
 * @param {number} from
 * @param {number} to
 * @param {object} [options]
 * @param {boolean} [options.ignoreDirection=false] Treat LEDs as two-way. Used to
 *        tell "backwards LED" apart from "no connection at all".
 * @param {boolean} [options.ignoreSwitches=false] Treat open switches as closed.
 * @returns {Edge[] | null} The edges on the path, in order, or null if none.
 */
export function findPath(edges, from, to, options = {}) {
  const { ignoreDirection = false, ignoreSwitches = false } = options;

  const usable = edges.filter(
    (edge) => edge.type !== 'battery' && (edge.conducts || (ignoreSwitches && edge.type === 'switch')),
  );

  // Keyed per edge, not per placement: the two halves of a potentiometer are
  // separate resistances and a path is allowed to cross both of them.
  const visitedEdges = new Set();

  /**
   * @param {number} net
   * @param {Edge[]} trail
   * @returns {Edge[] | null}
   */
  const walk = (net, trail) => {
    if (net === to) return trail;

    for (const edge of usable) {
      if (visitedEdges.has(edge.key)) continue;

      let next = null;
      if (edge.a === net) next = edge.b;
      else if (edge.b === net && (!edge.directional || ignoreDirection)) next = edge.a;

      if (next === null) continue;

      visitedEdges.add(edge.key);
      const found = walk(next, [...trail, edge]);
      if (found) return found;
      visitedEdges.delete(edge.key);
    }

    return null;
  };

  return walk(from, []);
}
