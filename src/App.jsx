/**
 * OWNER: Person C (Game Shell & Levels)
 *
 * App shell. For v1 there is exactly one level, so this just mounts it.
 * TODO(Person C): level select screen once level 2 exists.
 */

import { GameScreen } from './game/GameScreen.jsx';
import { LEVELS } from './content/levels/index.js';

export default function App() {
  return <GameScreen level={LEVELS[0]} />;
}
