/**
 * OWNER: Person B (Breadboard & Interaction)
 *
 * ── REFERENCE IMPLEMENTATION ─────────────────────────────────────────────
 * Finished. The pixel <-> hole mapping is the only place in the codebase that
 * knows about coordinates. The engine must never import this file.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Real breadboards use 0.1 inch (2.54 mm) hole spacing. We use 1 SVG unit = 1 mm
 * so the proportions match a physical board a student could pick up.
 */

import { BOTTOM_ROWS, COLUMNS, TOP_ROWS } from '../shared/holes.js';

/** @typedef {import('../shared/types.js').HoleId} HoleId */

export const PITCH = 2.54; // mm between hole centers — the real-world standard
export const MARGIN = 5;
export const RAIL_GAP = 3; // extra space between the rails and the main grid
export const CHANNEL = PITCH * 2; // the ravine down the middle, where chips straddle

/** y offset, in mm from the top of the board, for each row of holes. */
const ROW_Y = (() => {
  const y = {};
  let cursor = MARGIN;

  y.TP = cursor;
  cursor += PITCH;
  y.TN = cursor;
  cursor += PITCH + RAIL_GAP;

  for (const row of TOP_ROWS) {
    y[row] = cursor;
    cursor += PITCH;
  }
  cursor += CHANNEL - PITCH;

  for (const row of BOTTOM_ROWS) {
    y[row] = cursor;
    cursor += PITCH;
  }
  cursor += RAIL_GAP;

  y.BP = cursor;
  cursor += PITCH;
  y.BN = cursor;

  return y;
})();

export const BOARD_WIDTH = MARGIN * 2 + PITCH * (COLUMNS - 1);
export const BOARD_HEIGHT = ROW_Y.BN + MARGIN;

/**
 * Where to draw a hole.
 * @param {HoleId} id
 * @returns {{ x: number, y: number } | null} null for an unknown id
 */
export function holeCenter(id) {
  const match = /^([A-J]|TP|TN|BP|BN)(\d+)$/.exec(id);
  if (!match) return null;
  const [, row, colText] = match;
  const y = ROW_Y[row];
  if (y === undefined) return null;
  return { x: MARGIN + (Number(colText) - 1) * PITCH, y };
}

/**
 * Inverse of holeCenter: which hole did the player click?
 * Returns null when the click landed on plastic rather than a hole, so the
 * renderer can ignore it instead of snapping to something far away.
 *
 * @param {number} x SVG-space x
 * @param {number} y SVG-space y
 * @param {number} [tolerance=PITCH / 2]
 * @returns {HoleId | null}
 */
export function holeAt(x, y, tolerance = PITCH / 2) {
  const col = Math.round((x - MARGIN) / PITCH) + 1;
  if (col < 1 || col > COLUMNS) return null;

  let best = null;
  let bestDistance = Infinity;
  for (const [row, rowY] of Object.entries(ROW_Y)) {
    const distance = Math.abs(rowY - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = row;
    }
  }
  if (best === null) return null;

  const center = holeCenter(`${best}${col}`);
  if (!center) return null;
  const dx = center.x - x;
  const dy = center.y - y;
  if (Math.hypot(dx, dy) > tolerance) return null;

  return `${best}${col}`;
}

/** The y band of the center channel, for drawing the ravine. */
export function channelBand() {
  return { y: ROW_Y.E + PITCH * 0.5, height: CHANNEL - PITCH };
}

/** Row label -> y, exposed for the renderer's row/column legends. */
export function rowY(row) {
  return ROW_Y[row];
}
