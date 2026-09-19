/**
 * OWNER: Person B (Breadboard) — calibrated by whoever has the artwork.
 *
 * Lets a photo or render of a real breadboard sit under the interactive hole
 * grid, instead of the plain SVG board the game draws for itself.
 *
 * THE IMPORTANT RULE: the hole grid never moves. It is derived from real
 * 2.54 mm spacing in geometry.js and the whole engine depends on those hole
 * ids. Calibration moves the IMAGE to fit the holes, never the other way round.
 *
 * TO CALIBRATE (about two minutes):
 *   1. Put your file at public/assets/breadboard/breadboard.png
 *   2. Load the game with ?calibrate=1 in the URL
 *   3. Drag the sliders until the dots sit inside the image's holes
 *   4. Paste the numbers it shows you into DEFAULT_SKIN below
 *
 * Until an image exists, the game draws its own board and this file does
 * nothing. Nobody is blocked either way.
 */

import { BREADBOARD_IMAGE } from '../content/assets.js';

/**
 * Placement of the image inside the board's coordinate space, in millimetres.
 * The drawn board is 83.66 mm x ~48 mm, so these are near those numbers.
 *
 * @typedef {object} BoardSkin
 * @property {number} x       left edge of the image, in board mm
 * @property {number} y       top edge
 * @property {number} width   rendered width; height follows the image aspect
 * @property {number} opacity 0..1, handy while calibrating
 */

/** @type {BoardSkin} */
export const DEFAULT_SKIN = {
  x: -1.5,
  y: -1.5,
  width: 86.7,
  opacity: 1,
};

export const SKIN_IMAGE = BREADBOARD_IMAGE;

const STORAGE_KEY = 'breadboard:skin';

/**
 * Calibration is stored in localStorage while you drag the sliders, so a
 * refresh does not lose your work. DEFAULT_SKIN is the committed value.
 *
 * @returns {BoardSkin}
 */
export function loadSkin() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SKIN;
    return { ...DEFAULT_SKIN, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_SKIN;
  }
}

/** @param {BoardSkin} skin */
export function saveSkin(skin) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skin));
  } catch {
    // Private browsing, quota, whatever. Calibration just will not persist.
  }
}

export function clearSkin() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** True when the URL asks for the calibration sliders. */
export function calibrationRequested() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('calibrate');
}
