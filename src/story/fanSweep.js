/**
 * The timing of the desk fan's head sweep. Kept apart from FanProp.jsx so the
 * component file exports only a component (React Fast Refresh wants that) and
 * tests can share the numbers.
 */

/** Frame indices in sweep order: face right, turn to the left, come back. */
export const SWEEP = [0, 1, 2, 3, 4, 3, 2, 1];

/** Milliseconds per frame at full speed and at the slowest it still turns. */
export const FRAME_MS_FAST = 140;
export const FRAME_MS_SLOW = 520;

/** @param {number} speed 0..1 */
export function frameInterval(speed) {
  const s = Math.max(0, Math.min(1, speed));
  return Math.round(FRAME_MS_SLOW - (FRAME_MS_SLOW - FRAME_MS_FAST) * s);
}
