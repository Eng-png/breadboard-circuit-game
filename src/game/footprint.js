/**
 * OWNER: Person C (Game Shell & Levels)
 *
 * Where the second leg goes when you drop a part.
 *
 * Drag-and-drop asks the player for one hole, but every part needs two. This
 * file invents the second one. The rules are chosen so the *obvious* drop is
 * also the correct one, and the player only has to re-seat a leg when they
 * actually want something unusual:
 *
 *   - Drop on a rail: a battery goes across the rail pair (+ to −, which is
 *     what a rail pair is for). Everything else jumps from the rail into the
 *     nearest row of the main grid, which is the move that gets power onto
 *     the board.
 *   - Drop on the main grid: the part lies along its row, spanning its own
 *     body width in columns. Near the right edge it reaches left instead.
 *
 * Nothing here knows about pixels. A footprint is two hole ids.
 */

import { COLUMNS, hole, parseHole, railHole } from '../shared/holes.js';

/** @typedef {import('../shared/types.js').HoleId} HoleId */
/** @typedef {import('../shared/types.js').ComponentType} ComponentType */

/**
 * Columns a part covers when it is lying in the main grid. These are the body
 * widths from Part.jsx rounded up to whole holes, so a dropped part never
 * overlaps its own legs.
 */
const SPAN = {
  wire: 5,
  battery: 4,
  switch: 3,
  resistor: 3,
  led: 3,
};

const DEFAULT_SPAN = 3;

/** @param {ComponentType} type */
export function spanOf(type) {
  return SPAN[type] ?? DEFAULT_SPAN;
}

/** The other half of a rail pair: + and − of the same end of the board. */
const RAIL_PARTNER = { TP: 'TN', TN: 'TP', BP: 'BN', BN: 'BP' };

/** The row of the main grid a rail sits next to. */
const RAIL_NEIGHBOUR_ROW = { TP: 'A', TN: 'A', BP: 'J', BN: 'J' };

/**
 * The pair of holes a part occupies when dropped with one leg on `anchor`.
 *
 * @param {ComponentType} type
 * @param {HoleId} anchor
 * @returns {[HoleId, HoleId] | null} null when it will not fit
 */
export function footprintFor(type, anchor) {
  const parsed = parseHole(anchor);
  if (!parsed) return null;

  if (parsed.kind === 'rail') {
    const partner =
      type === 'battery'
        ? railHole(RAIL_PARTNER[parsed.row], parsed.col)
        : hole(RAIL_NEIGHBOUR_ROW[parsed.row], parsed.col);
    return [anchor, partner];
  }

  const span = spanOf(type);
  const col = parsed.col + span <= COLUMNS ? parsed.col + span : parsed.col - span;
  if (col < 1) return null;
  return [anchor, hole(parsed.row, col)];
}

/**
 * Somewhere sensible to drop a part when nobody pointed at a hole — the
 * keyboard path, where there is no pointer to read a position from.
 *
 * Walks the main grid for a spot whose two holes are both free, so parts
 * placed by keyboard land in a tidy row rather than on top of each other.
 *
 * @param {ComponentType} type
 * @param {import('../shared/types.js').Placement[]} placements
 * @returns {[HoleId, HoleId] | null}
 */
export function firstFreeFootprint(type, placements) {
  const taken = new Set(placements.flatMap((placement) => placement.holes));

  for (const row of ['A', 'F', 'B', 'G', 'C', 'H', 'D', 'I', 'E', 'J']) {
    for (let col = 1; col <= COLUMNS; col += 1) {
      const spot = footprintFor(type, hole(row, col));
      if (spot && !taken.has(spot[0]) && !taken.has(spot[1])) return spot;
    }
  }
  return null;
}
