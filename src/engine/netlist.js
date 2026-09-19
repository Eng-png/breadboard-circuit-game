/**
 * OWNER: Person A (Circuit Engine)
 *
 * ── REFERENCE IMPLEMENTATION ─────────────────────────────────────────────
 * This file is finished and tested. It exists so the rest of the team has a
 * working example of the house style: pure functions, no React, no DOM,
 * JSDoc types, unit tests next door in __tests__/. Copy this shape.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * A "netlist" answers one question: which holes are electrically the same point?
 *
 * Two holes are the same point if:
 *   1. The breadboard's internal copper joins them (a five-hole strip, or a rail), OR
 *   2. The player ran a wire between them, OR
 *   3. They are chained together through 1 and 2 repeatedly.
 *
 * That last clause is why this is a union-find (disjoint set) problem and not
 * a simple lookup.
 *
 * Note that only WIRES merge nets. A resistor, LED, switch or battery has a
 * voltage across it, so its two pins are deliberately NOT merged — those are
 * the edges the solver in simulate.js walks between nets.
 */

import { allHoles, internalStrips } from '../shared/holes.js';

/** @typedef {import('../shared/types.js').HoleId} HoleId */
/** @typedef {import('../shared/types.js').Placement} Placement */
/** @typedef {import('../shared/types.js').Net} Net */

/**
 * Group every hole on the board into nets.
 *
 * @param {Placement[]} placements
 * @returns {{ nets: Net[], netOf: (hole: HoleId) => number }}
 */
export function buildNetlist(placements) {
  const parent = new Map();

  const find = (x) => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root);
    // Path compression: flatten the chain so later lookups are O(1)-ish.
    let walk = x;
    while (parent.get(walk) !== root) {
      const next = parent.get(walk);
      parent.set(walk, root);
      walk = next;
    }
    return root;
  };

  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  };

  for (const id of allHoles()) parent.set(id, id);

  // 1. The copper that ships inside the breadboard.
  for (const strip of internalStrips()) {
    for (let i = 1; i < strip.length; i += 1) union(strip[0], strip[i]);
  }

  // 2. Wires the player added. Only wires merge nets.
  for (const placement of placements) {
    if (placement.type !== 'wire') continue;
    const [from, to] = placement.holes;
    if (parent.has(from) && parent.has(to)) union(from, to);
  }

  // Collapse the forest into numbered nets.
  const rootToNetId = new Map();
  const nets = [];
  const holeToNetId = new Map();

  for (const id of allHoles()) {
    const root = find(id);
    let netId = rootToNetId.get(root);
    if (netId === undefined) {
      netId = nets.length;
      rootToNetId.set(root, netId);
      nets.push({ id: netId, holes: [] });
    }
    nets[netId].holes.push(id);
    holeToNetId.set(id, netId);
  }

  return {
    nets,
    netOf: (hole) => holeToNetId.get(hole) ?? -1,
  };
}
