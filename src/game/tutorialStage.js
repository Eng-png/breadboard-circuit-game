/**
 * OWNER: Person C (rules) / Person D (which stage says what)
 *
 * Which of the mouse's speeches is due, and where that one stands. Kept out of
 * PuzzlePanel because it is a pure reading of the board and it is the part
 * most likely to keep growing — adding a stage should be a line here and a
 * string in content/tutorial.js, and nothing else.
 *
 * A stage is a key into the level's `tutorial`. A layout is where that speech
 * appears on screen, and several stages can share one: a new stage that only
 * changes the words reuses a layout that already exists.
 */

import { parseHole } from '../shared/holes.js';

/**
 * Where each stage stands.
 *   beside   — left of the toolbox, text above the mouse's head
 *   perched  — mouse on top of the toolbox, text to the left of it
 *   over     — laid across the board: mouse at its left edge, text on the
 *              bottom half. PuzzlePanel mounts these inside the board.
 *
 * @type {Record<string, 'beside'|'perched'|'over'>}
 */
export const TUTORIAL_LAYOUT = {
  placing: 'beside',
  placed: 'perched',
  board: 'over',
  feed: 'over',
};

/** Both legs on rails, whichever pair. */
const onRails = (placement) =>
  placement.holes.length > 0 && placement.holes.every((id) => parseHole(id)?.kind === 'rail');

/**
 * One end on a positive rail, the other in the main grid — power brought off
 * the rail and onto the board proper, which is the move every circuit starts
 * with and the one nothing on screen explains.
 */
const feedsFromPositiveRail = (placement) => {
  if (placement.type !== 'wire' || placement.holes.length !== 2) return false;
  const ends = placement.holes.map((id) => parseHole(id));
  if (ends.some((end) => !end)) return false;
  // 'TP' and 'BP' are the two positive rails; 'TN' and 'BN' are the negative.
  const positive = ends.filter((end) => end.kind === 'rail' && end.row.endsWith('P'));
  const main = ends.filter((end) => end.kind === 'main');
  return positive.length === 1 && main.length === 1;
};

/**
 * The speech that is due, latest milestone first. Null means the mouse has
 * nothing to add right now and stays off screen.
 *
 * @param {import('../shared/types.js').Placement[]} placements
 * @param {boolean} touched  The player has changed the board at least once
 * @returns {string | null}
 */
export function tutorialStageFor(placements, touched) {
  if (placements.some(feedsFromPositiveRail)) return 'feed';
  if (placements.some((placement) => placement.type === 'battery' && onRails(placement))) {
    return 'board';
  }
  if (placements.some((placement) => placement.type === 'wire')) return 'placed';
  if (!touched) return 'placing';
  return null;
}
