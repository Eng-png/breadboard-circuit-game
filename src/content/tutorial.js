/**
 * OWNER: Person D (copy)
 *
 * What the mouse says while the player learns the board, in three goes.
 *
 *   PLACING  from the moment the board appears until the player drags their
 *            first part. It teaches the one gesture everything depends on.
 *   PLACED   from the moment a wire is on the board. They can work the
 *            toolbox now, so this one is about what to do with a wire.
 *   BOARD    once the battery is across the power rails. This one is about
 *            the board itself, so it is shown on the board, not beside it.
 *   FEED     once a wire carries the + rail into the main grid. Same place on
 *            the board as BOARD — only the words change.
 *
 * THIS IS PLACEHOLDER COPY. Rewrite the strings and nothing else changes —
 * TutorialMouse renders whatever lines it is handed, however many.
 *
 * Which levels get a mouse at all is decided in the level files, not here.
 */

/** Before the player has dragged anything. @type {string[]} */
export const TUTORIAL_PLACING = [
  'PLACEHOLDER — Press and hold a part in the toolbox, then drag it out onto the board.',
  'PLACEHOLDER — Let go over a hole. The ghost shows you where it will land.',
];

/** Once there is a wire on the board. @type {string[]} */
export const TUTORIAL_PLACED = [
  'PLACEHOLDER — Nice. That wire joins the two holes it sits in into one point.',
  'PLACEHOLDER — To move just one end of it, grab the dot on that tip and drag it somewhere else.',
];

/** Once the battery is on the power rails. Shown across the board. @type {string[]} */
export const TUTORIAL_BOARD = [
  'PLACEHOLDER — Holes in the same column strip are already joined inside the board.',
  'PLACEHOLDER — The gap down the middle splits every column in two, so the halves are not connected.',
];

/**
 * Once a wire runs from a positive rail into the main grid. Shown in the same
 * place as TUTORIAL_BOARD — this stage changes the words, not the position.
 * @type {string[]}
 */
export const TUTORIAL_FEED = [
  'PLACEHOLDER — That wire brings power off the + rail and onto the board itself.',
  'PLACEHOLDER — Everything in that column strip is now live. Build the rest of the loop from there.',
];
