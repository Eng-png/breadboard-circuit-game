/**
 * OWNER: Person C (Game Shell & Story)
 *
 * Level 1 is the whole game for now, so this mounts it directly.
 *
 * When level 2 exists, this becomes the place that picks which story + level
 * pair to run. Nothing else needs to change — that is why the story and the
 * puzzle are passed in as data rather than imported inside StoryScreen.
 */

import { StoryScreen } from './story/StoryScreen.jsx';
import { level1Story } from './story/level1Story.js';
import { LEVELS } from './content/levels/index.js';

export default function App() {
  return <StoryScreen level={LEVELS[0]} story={level1Story} />;
}
