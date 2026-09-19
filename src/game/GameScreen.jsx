/**
 * OWNER: Person C (Game Shell & Levels)  — STUB layout.
 *
 * The frame everything else slots into. Person C owns this file; B fills the
 * board area, D fills the tray art and the teaching copy.
 *
 * TODO(Person C):
 *   - Pass real handlers into <Breadboard> (place, remove, toggle switch).
 *   - Show faults from context.result.faults as friendly inline coaching.
 *   - Win overlay with the level's realWorld note and a "next level" button.
 *   - Undo / reset buttons wired to the reducer.
 */

import { Breadboard } from '../breadboard/Breadboard.jsx';
import { HintPanel } from '../ui/HintPanel.jsx';
import { ObjectiveList } from '../ui/ObjectiveList.jsx';
import { Tray } from '../ui/Tray.jsx';
import { useGameState } from './useGameState.js';
import './GameScreen.css';

/**
 * @param {{ level: import('../shared/types.js').Level }} props
 */
export function GameScreen({ level }) {
  const { state, dispatch, context, objectives, won } = useGameState(level);

  return (
    <div className="game">
      <header className="game__header">
        <h1>{level.title}</h1>
        <p className="game__brief">{level.brief}</p>
      </header>

      <main className="game__board">
        <Breadboard placements={state.placements} />
      </main>

      <aside className="game__sidebar">
        <Tray level={level} placements={state.placements} />
        <ObjectiveList objectives={objectives} won={won} />
        <HintPanel
          hints={level.hints}
          revealed={state.hintsRevealed}
          onReveal={() => dispatch({ type: 'revealHint' })}
        />
      </aside>

      {/* TODO(Person C): fault coaching strip, driven by context.result.faults */}
      <footer className="game__status">
        {context.result.complete ? 'Circuit complete' : 'No complete loop yet'}
      </footer>
    </div>
  );
}
