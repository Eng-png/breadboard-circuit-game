/**
 * OWNER: Person C (registry) / Person D (adding levels)
 *
 * Add a level file next to this one and register it here. Order defines the
 * order the player plays them in.
 */

import { level1 } from './level1.js';

/** @type {import('../../shared/types.js').Level[]} */
export const LEVELS = [level1];

/** @param {string} id */
export function getLevel(id) {
  return LEVELS.find((level) => level.id === id) ?? null;
}
