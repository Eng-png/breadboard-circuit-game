/**
 * OWNER: Person A (Circuit Engine)  — THIS IS A STUB. Person A implements it.
 *
 * simulate() is the heart of the game. Everything else is a way to call it or
 * a way to draw its output.
 *
 * WHAT IT MUST DO (see docs/ARCHITECTURE.md for the full spec):
 *
 *  1. Call buildNetlist(placements) to collapse holes into nets.
 *  2. Treat each non-wire component as an EDGE between the two nets its pins
 *     sit in. Build a graph where nodes = nets, edges = components.
 *       - An open switch contributes NO edge (that is what "open" means).
 *       - A closed switch is a plain wire-like edge with ~0 resistance.
 *       - An LED only conducts anode -> cathode (it is a one-way valve).
 *  3. Find the battery. Walk from its + net to its - net.
 *       - No path  -> complete: false, fault OPEN_CIRCUIT
 *       - A path with no resistor/LED on it -> shorted: true, fault SHORT_CIRCUIT
 *  4. For each component on a live path, set energized / currentMa.
 *     Level 1 only needs a single series loop, so Ohm's law over the summed
 *     resistance is enough: I = V / R_total. Do NOT build a full nodal analysis
 *     solver yet — series-only is the agreed scope for v1.
 *  5. Decide lit / reverseBiased / burnedOut for each LED using the numbers in
 *     the component catalog (src/content/components.js).
 *  6. Produce faults[] in TEACHING language. "Nothing happens because the
 *     circuit has a gap — electricity needs a complete loop" beats "open circuit".
 *
 * RULES:
 *  - Pure function. No React, no DOM, no randomness, no mutation of the input.
 *  - Always return a fully-shaped CircuitResult, even on garbage input.
 *  - Every branch gets a unit test in __tests__/simulate.test.js.
 */

import { buildNetlist } from './netlist.js';

/** @typedef {import('../shared/types.js').Placement} Placement */
/** @typedef {import('../shared/types.js').CircuitResult} CircuitResult */

/**
 * @param {Placement[]} placements
 * @param {object} [options]
 * @param {'asPlaced'|'forceOpen'|'forceClosed'} [options.switches='asPlaced']
 *        Lets the game shell ask "would this work if the switch were flipped?"
 *        without mutating game state. Needed for the level-1 win condition.
 * @returns {CircuitResult}
 */
export function simulate(placements, options = {}) {
  const { switches = 'asPlaced' } = options;
  const { nets } = buildNetlist(placements);

  // TODO(Person A): everything above. Until then we return a valid empty
  // result so the renderer and game shell can be built against the real shape.
  void switches;

  return {
    complete: false,
    shorted: false,
    nets,
    components: Object.fromEntries(
      placements.map((p) => [p.id, { energized: false, currentMa: 0 }]),
    ),
    faults: [],
  };
}

/**
 * Convenience wrapper the game shell calls once per state change. Runs the
 * three simulations an ObjectiveContext needs.
 *
 * @param {Placement[]} placements
 * @returns {import('../shared/types.js').ObjectiveContext}
 */
export function simulateAll(placements) {
  return {
    result: simulate(placements),
    resultOpen: simulate(placements, { switches: 'forceOpen' }),
    resultClosed: simulate(placements, { switches: 'forceClosed' }),
    placements,
  };
}
