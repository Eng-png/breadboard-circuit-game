/**
 * OWNER: Person C (Game Shell & Levels)  — STUB.
 *
 * The single source of truth for one level's play session. Every change the
 * player makes goes through dispatch(), which means undo is nearly free and
 * the engine only ever sees a consistent snapshot.
 *
 * TODO(Person C):
 *   - Implement place / remove / toggleSwitch / reset / undo.
 *   - Enforce tray counts: you cannot place a second battery in level 1.
 *   - Recompute simulateAll() with useMemo whenever placements change.
 *   - Evaluate level.objectives against that context and expose which passed.
 *   - Fire onWin once, when every objective passes for the first time.
 */

import { useMemo, useReducer } from 'react';
import { simulateAll } from '../engine/simulate.js';

/** @typedef {import('../shared/types.js').Placement} Placement */
/** @typedef {import('../shared/types.js').Level} Level */

/**
 * @typedef {object} GameState
 * @property {Placement[]} placements
 * @property {Placement[][]} history   Snapshots for undo, newest last
 * @property {number} hintsRevealed
 */

/** @type {(level: Level) => GameState} */
const initialState = (level) => ({
  placements: [...level.preplaced],
  history: [],
  hintsRevealed: 0,
});

/**
 * @param {GameState} state
 * @param {{ type: string, [key: string]: unknown }} action
 * @returns {GameState}
 */
function reducer(state, action) {
  switch (action.type) {
    // TODO(Person C): 'place' | 'remove' | 'toggleSwitch' | 'undo' | 'reset'
    case 'revealHint':
      return { ...state, hintsRevealed: state.hintsRevealed + 1 };
    default:
      return state;
  }
}

/**
 * @param {Level} level
 */
export function useGameState(level) {
  const [state, dispatch] = useReducer(reducer, level, initialState);

  const context = useMemo(() => simulateAll(state.placements), [state.placements]);

  const objectives = useMemo(
    () =>
      level.objectives.map((objective) => ({
        ...objective,
        passed: objective.check(context),
      })),
    [level.objectives, context],
  );

  const won = objectives.length > 0 && objectives.every((o) => o.passed);

  return { state, dispatch, context, objectives, won };
}
