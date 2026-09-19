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
