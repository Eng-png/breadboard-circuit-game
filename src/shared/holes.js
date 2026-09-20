/**
 * Hole ID helpers — the shared language between the renderer and the engine.
 *
 * OWNED BY: everyone (shared). Prefer adding helpers here over re-deriving
 * hole-id string parsing in your own file.
 *
 * A real half-size breadboard has 30 columns. Each column has two independent
 * five-hole strips (A-E above the center channel, F-J below it) plus four
 * long power rails running the full width.
 */

/** Number of numbered columns on the board. */
export const COLUMNS = 30;

/** Main-grid row letters, top to bottom. The channel sits between E and F. */
export const TOP_ROWS = ['A', 'B', 'C', 'D', 'E'];
export const BOTTOM_ROWS = ['F', 'G', 'H', 'I', 'J'];
export const MAIN_ROWS = [...TOP_ROWS, ...BOTTOM_ROWS];

/** The four power rails. TP = top positive, BN = bottom negative, etc. */
export const RAILS = ['TP', 'TN', 'BP', 'BN'];

/**
 * Every row on the board, top to bottom, rails included. Dragging works in
 * whole rows and whole columns, so it needs one ordered list to count along —
 * this is it. Physical order only; it says nothing about what is connected.
 */
export const ROW_ORDER = ['TP', 'TN', ...TOP_ROWS, ...BOTTOM_ROWS, 'BP', 'BN'];

/** @typedef {import('./types.js').HoleId} HoleId */

/**
 * Build a main-grid hole id.
 * @param {string} row  One of MAIN_ROWS
 * @param {number} col  1-indexed, 1..COLUMNS
 * @returns {HoleId}
 */
export function hole(row, col) {
  return `${row}${col}`;
}

/**
 * Build a power-rail hole id.
 * @param {'TP'|'TN'|'BP'|'BN'} rail
 * @param {number} col 1-indexed
 * @returns {HoleId}
 */
export function railHole(rail, col) {
  return `${rail}${col}`;
}

/**
 * Split a hole id back into its parts.
 * @param {HoleId} id
 * @returns {{ kind: 'main'|'rail', row: string, col: number } | null}
 */
export function parseHole(id) {
  const match = /^([A-J]|TP|TN|BP|BN)(\d+)$/.exec(id);
  if (!match) return null;
  const [, row, colText] = match;
  const col = Number(colText);
  if (col < 1 || col > COLUMNS) return null;
  return { kind: RAILS.includes(row) ? 'rail' : 'main', row, col };
}

/** @param {HoleId} id */
export function isRailHole(id) {
  return parseHole(id)?.kind === 'rail';
}

/**
 * Move a hole id by whole rows and columns. Returns null if that would walk off
 * the edge of the board, which is how the drag code says "you cannot put it
 * there" without needing to know anything about pixels.
 *
 * @param {HoleId} id
 * @param {number} rows  Positive = down the board
 * @param {number} cols  Positive = to the right
 * @returns {HoleId | null}
 */
export function shiftHole(id, rows, cols) {
  const parsed = parseHole(id);
  if (!parsed) return null;

  const rowIndex = ROW_ORDER.indexOf(parsed.row) + rows;
  const col = parsed.col + cols;
  if (rowIndex < 0 || rowIndex >= ROW_ORDER.length) return null;
  if (col < 1 || col > COLUMNS) return null;

  return `${ROW_ORDER[rowIndex]}${col}`;
}

/**
 * How far you would have to move to get from one hole to another.
 * Inverse of shiftHole.
 *
 * @param {HoleId} from
 * @param {HoleId} to
 * @returns {{ rows: number, cols: number } | null}
 */
export function holeDelta(from, to) {
  const a = parseHole(from);
  const b = parseHole(to);
  if (!a || !b) return null;
  return {
    rows: ROW_ORDER.indexOf(b.row) - ROW_ORDER.indexOf(a.row),
    cols: b.col - a.col,
  };
}

/**
 * Every valid hole id on the board. Useful for rendering and for tests.
 * @returns {HoleId[]}
 */
export function allHoles() {
  const out = [];
  for (let col = 1; col <= COLUMNS; col += 1) {
    for (const rail of RAILS) out.push(railHole(rail, col));
    for (const row of MAIN_ROWS) out.push(hole(row, col));
  }
  return out;
}

/**
 * The groups of holes that a real breadboard wires together internally,
 * before the player adds a single wire.
 *
 * This is THE physical fact the whole game teaches: holes in the same strip
 * are already connected; holes across the center channel are not.
 *
 * @returns {HoleId[][]} Each inner array is one internally-connected strip.
 */
export function internalStrips() {
  const strips = [];

  // Each power rail is one long strip running the full width of the board.
  for (const rail of RAILS) {
    strips.push(Array.from({ length: COLUMNS }, (_, i) => railHole(rail, i + 1)));
  }

  // Each column contributes two five-hole strips, separated by the channel.
  for (let col = 1; col <= COLUMNS; col += 1) {
    strips.push(TOP_ROWS.map((row) => hole(row, col)));
    strips.push(BOTTOM_ROWS.map((row) => hole(row, col)));
  }

  return strips;
}
