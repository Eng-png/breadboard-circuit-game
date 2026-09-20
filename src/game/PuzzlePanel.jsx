/**
 * OWNER: Person C (layout & wiring) — the three subsystems meet here.
 *
 * Presentational on purpose: it does not own game state. StoryScreen calls
 * useGameState and hands the result down, because the story needs to read the
 * circuit too (to know how bright the room is). One owner, two readers.
 *
 * B's board events go in through dispatch. A's CircuitResult comes back out and
 * drives what B renders and what the player is told.
 */

import { Breadboard } from '../breadboard/Breadboard.jsx';
import { HintPanel } from '../ui/HintPanel.jsx';
import { Knob } from '../ui/Knob.jsx';
import { ObjectiveList } from '../ui/ObjectiveList.jsx';
import { Tray } from '../ui/Tray.jsx';
import './PuzzlePanel.css';

/**
 * @param {object} props
 * @param {import('../shared/types.js').Level} props.level
 * @param {ReturnType<typeof import('./useGameState.js').useGameState>} props.game
 */
export function PuzzlePanel({ level, game }) {
  const { state, dispatch, context, objectives } = game;

  /** Clicking a switch flips it; clicking anything else takes it back off the board. */
  const handlePartClick = (id) => {
    const placement = state.placements.find((item) => item.id === id);
    if (!placement) return;
    if (placement.type === 'switch') dispatch({ type: 'toggleSwitch', id });
    else dispatch({ type: 'remove', id });
  };

  const status = state.notice ?? statusLine(context.result);
  const knobs = state.placements.filter((placement) => placement.type === 'potentiometer');

  return (
    <div className="puzzle">
      <div className="puzzle__board">
        <Breadboard
          placements={state.placements}
          result={context.result}
          pending={state.pending}
          onHoleClick={(hole) => dispatch({ type: 'holeClick', hole })}
          onPartClick={handlePartClick}
          onPartTurn={(id, turn) => dispatch({ type: 'setTurn', id, turn })}
        />

        {knobs.length > 0 && (
          <div className="puzzle__knobs">
            {knobs.map((placement) => (
              <Knob
                key={placement.id}
                placement={placement}
                result={context.result.components[placement.id]}
                onTurn={(turn) => dispatch({ type: 'setTurn', id: placement.id, turn })}
              />
            ))}
          </div>
        )}

        <div className="puzzle__toolbar">
          <button
            type="button"
            className="button--ghost"
            onClick={() => dispatch({ type: 'undo' })}
            disabled={state.history.length === 0}
          >
            Undo
          </button>
          <button
            type="button"
            className="button--ghost"
            onClick={() => dispatch({ type: 'reset' })}
            disabled={state.placements.length === 0}
          >
            Clear board
          </button>
          <span className="puzzle__tip">
            Click a switch to flip it. Click any other part to take it off.
            {knobs.length > 0 && ' Drag the dimmer up for brighter, down for dimmer.'}
          </span>
        </div>

        <p
          className="puzzle__status"
          data-tone={toneOf(context.result, state.notice)}
          aria-live="polite"
        >
          {status}
        </p>
      </div>

      <aside className="puzzle__sidebar">
        <Tray
          level={level}
          placements={state.placements}
          pending={state.pending}
          onArm={(componentType) => dispatch({ type: 'arm', componentType })}
        />
        <ObjectiveList objectives={objectives} />
        <HintPanel
          hints={level.hints}
          revealed={state.hintsRevealed}
          onReveal={() => dispatch({ type: 'revealHint' })}
        />
      </aside>
    </div>
  );
}

/**
 * One line of coaching. Show the first fault only — four red messages at once
 * teaches nothing.
 *
 * @param {import('../shared/types.js').CircuitResult} result
 */
function statusLine(result) {
  if (result.faults.length > 0) return result.faults[0].message;
  if (result.complete) return 'Current is flowing all the way round the loop.';
  return 'The board is empty. Start with the battery — nothing moves without it.';
}

function toneOf(result, notice) {
  if (notice) return 'warn';
  if (result.shorted) return 'error';
  if (result.faults.length > 0) return 'warn';
  if (result.complete) return 'ok';
  return 'neutral';
}
