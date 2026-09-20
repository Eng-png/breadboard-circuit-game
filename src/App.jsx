/**
 * OWNER: Person C (Game Shell & Story)
 *
 * Picks which story + level pair to run. Levels are played in the order they
 * are registered in content/levels; each level's end beat offers the next one,
 * and the header lets the player jump to any level directly.
 *
 * `key` remounts StoryScreen on a level change, so story position and board
 * state start clean instead of leaking from the previous level.
 */

import { useState } from 'react';
import { LevelNav } from './story/LevelNav.jsx';
import { StoryScreen } from './story/StoryScreen.jsx';
import { getStory } from './story/index.js';
import { LEVELS } from './content/levels/index.js';

export default function App() {
  const [levelIndex, setLevelIndex] = useState(0);

  const level = LEVELS[levelIndex];
  const story = getStory(level.id);
  const upcoming = LEVELS[levelIndex + 1];

  const nextLevel = upcoming
    ? {
        label: `Continue to ${getStory(upcoming.id)?.chapter ?? upcoming.title}`,
        onSelect: () => setLevelIndex(levelIndex + 1),
      }
    : null;

  return (
    <StoryScreen
      key={level.id}
      level={level}
      story={story}
      nextLevel={nextLevel}
      levelNav={<LevelNav levels={LEVELS} current={levelIndex} onSelect={setLevelIndex} />}
    />
  );
}
