/**
 * The desk fan's head sweep, as a small state machine. Kept apart from
 * FanProp.jsx so the component file exports only a component (React Fast
 * Refresh wants that) and tests can drive the numbers directly.
 *
 * Frames run 0 (facing right) .. LAST (facing left). The head moves one frame
 * per tick in `dir` (+1 towards the left, -1 back towards the right). A bare
 * motor does not know where the ends are: when it reaches one it just stops
 * there, stalled. A limit switch at that end changes that — the switch is
 * pressed, the Arduino sees it and reverses the motor, and the head sweeps the
 * other way. Two switches, one at each end, and it sweeps forever.
 */

export const LAST = 4;

/**
 * Milliseconds per frame at full speed and at the slowest it still turns. A
 * real oscillating fan is unhurried: at full speed one right→left→right pass
 * takes about four seconds.
 */
export const FRAME_MS_FAST = 500;
export const FRAME_MS_SLOW = 1200;

/** @param {number} speed 0..1 */
export function frameInterval(speed) {
  const s = Math.max(0, Math.min(1, speed));
  return Math.round(FRAME_MS_SLOW - (FRAME_MS_SLOW - FRAME_MS_FAST) * s);
}

/**
 * @typedef {object} SweepState
 * @property {number} frame  0..LAST
 * @property {1 | -1} dir    +1 = turning towards the left end (frame LAST)
 * @property {boolean} stalled  Reached an end with nothing there to turn it round
 */

/** @type {SweepState} */
export const START = { frame: 0, dir: 1, stalled: false };

/** Which end the head is up against when it can go no further in `dir`. */
export const endFor = (dir) => (dir > 0 ? 'left' : 'right');

/**
 * One tick of the motor.
 *
 * @param {SweepState} state
 * @param {{ left: boolean, right: boolean }} limits  Which ends have a limit switch
 * @returns {{ state: SweepState, hit: 'left' | 'right' | null }}
 *   `hit` is the switch that was pressed on this tick, if any.
 */
export function stepSweep(state, limits) {
  const next = state.frame + state.dir;
  if (next >= 0 && next <= LAST) {
    return { state: { frame: next, dir: state.dir, stalled: false }, hit: null };
  }
  const end = endFor(state.dir);
  if (!limits[end]) {
    return { state: { ...state, stalled: true }, hit: null };
  }
  const dir = /** @type {1 | -1} */ (-state.dir);
  return { state: { frame: state.frame + dir, dir, stalled: false }, hit: end };
}
