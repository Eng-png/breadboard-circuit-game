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
 * @property {Placement} placement
 * @property {import('../shared/types.js').ComponentType} type
 * @property {number} a          net id at pins[0]
 * @property {number} b          net id at pins[1]
 * @property {boolean} conducts  false means the edge is not traversable at all
 * @property {boolean} directional  true for an LED: only a -> b
 * @property {number} ohms
 * @property {number} forwardVolts  voltage this part drops before Ohm's law
 * @property {number} volts         batteries only
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

    const [first, second] = placement.holes;
    if (!first || !second) continue;

    const a = netOf(first);
    const b = netOf(second);
    if (a === -1 || b === -1) continue;

    const electrical = getComponent(placement.type).electrical ?? {};

    edges.push({
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
  if (placement.type === 'potentiometer') return potentiometerOhms(placement, electrical);
  if (placement.type === 'led') return LED_INTERNAL_OHMS;
  return IDEAL_OHMS; // switch, battery
}

/**
 * A potentiometer's resistance follows its knob: linear from minOhms to maxOhms.
 * @param {Placement} placement
 */
export function potentiometerOhms(placement, electrical) {
  const turn = Math.min(1, Math.max(0, placement.state?.turn ?? 0));
  const min = electrical.minOhms ?? 0;
  const max = electrical.maxOhms ?? min;
  return min + turn * (max - min);
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

  const visitedEdges = new Set();

  /**
   * @param {number} net
   * @param {Edge[]} trail
   * @returns {Edge[] | null}
   */
  const walk = (net, trail) => {
    if (net === to) return trail;

    for (const edge of usable) {
      if (visitedEdges.has(edge.placement.id)) continue;

      let next = null;
      if (edge.a === net) next = edge.b;
      else if (edge.b === net && (!edge.directional || ignoreDirection)) next = edge.a;

      if (next === null) continue;

      visitedEdges.add(edge.placement.id);
      const found = walk(next, [...trail, edge]);
      if (found) return found;
      visitedEdges.delete(edge.placement.id);
    }

    return null;
  };

  return walk(from, []);
}
