/**
 * OWNER: Person C (registry)
 *
 * One story per level, keyed by the level id it narrates. App.jsx pairs each
 * entry in content/levels with its story here.
 */

import { level1Story } from './level1Story.js';
import { level2Story } from './level2Story.js';
import { level3Story } from './level3Story.js';

export const STORIES = [level1Story, level2Story, level3Story];

/** @param {string} levelId */
export function getStory(levelId) {
  return STORIES.find((story) => story.id === levelId) ?? null;
}
