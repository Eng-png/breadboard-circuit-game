/** Unique ids for placements. Kept in one place so ids never collide. */

let counter = 0;

/**
 * @param {string} prefix Usually the component type, e.g. "led"
 * @returns {string} e.g. "led-3"
 */
export function makeId(prefix) {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** Only for tests, so ids are predictable between cases. */
export function resetIds() {
  counter = 0;
}
