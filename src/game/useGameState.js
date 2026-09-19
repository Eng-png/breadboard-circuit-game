/**
 * OWNER: Person C (Game Shell & Levels)
 *
 * The single source of truth for one level's play session. Every change the
 * player makes goes through dispatch(), which is what makes undo nearly free
 * and guarantees the engine only ever sees a consistent snapshot.
 *
 * INTERACTION MODEL (the v1 cut — click, don't drag):
 *   1. Click a part in the tray  -> it becomes "armed"
 *   2. Click a hole              -> first leg goes down
 *   3. Click a second hole       -> the part is placed
 *   Escape cancels. Clicking a placed switch toggles it. Right-click removes.
 *
 * Drag-and-drop is a later upgrade. This teaches the same thing with a
 * fraction of the code, and it works on a touchscreen for free.
 */

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { simulateAll } from '../engine/simulate.js';
import { makeId } from '../shared/ids.js';

/** @typedef {import('../shared/types.js').Placement} Placement */
/** @typedef {import('../shared/types.js').Level} Level */
/** @typedef {import('../shared/types.js').HoleId} HoleId */

/**
 * @typedef {object} GameState
 * @property {Placement[]} placements
 * @property {{ type: string, firstHole: HoleId | null } | null} pending
 * @property {Placement[][]} history   Snapshots for undo, newest last
 * @property {number} hintsRevealed
 * @property {string | null} notice    Transient message, e.g. "no wires left"
 */

/** @param {Level} level @returns {GameState} */
const initialState = (level) => ({
  placements: [...level.preplaced],
  pending: null,
  history: [],
  hintsRevealed: 0,
  notice: null,
});

/**
 * How many of this type the level still allows.
 * @param {Level} level
 * @param {Placement[]} placements
 * @param {string} type
 */
export function remainingOf(level, placements, type) {
  const allowance = level.tray.find((item) => item.type === type)?.count ?? 0;
  if (allowance === Infinity) return Infinity;
  return allowance - placements.filter((placement) => placement.type === type).length;
}

/**
 * @param {GameState} state
 * @param {{ type: string, [key: string]: any }} action
 * @returns {GameState}
 */
function reducer(state, action) {
  /** Snapshot the current placements so `undo` can come back here. */
  const commit = (placements, extra = {}) => ({
    ...state,
    placements,
    history: [...state.history, state.placements],
    pending: null,
    notice: null,
    ...extra,
  });

  switch (action.type) {
    case 'arm': {
      // Clicking the armed part again puts it back down.
      if (state.pending?.type === action.componentType) {
        return { ...state, pending: null, notice: null };
      }
      if (remainingOf(action.level, state.placements, action.componentType) <= 0) {
        return {
          ...state,
          notice: `You have used all the ${action.componentType}s this level gives you.`,
        };
      }
      return {
        ...state,
        pending: { type: action.componentType, firstHole: null },
        notice: null,
      };
    }

    case 'holeClick': {
      if (!state.pending) return state;

      // First leg.
      if (!state.pending.firstHole) {
        return {
          ...state,
          pending: { ...state.pending, firstHole: action.hole },
          notice: null,
        };
      }

      // Both legs cannot share one hole — there is only room for one wire end.
      if (state.pending.firstHole === action.hole) {
        return { ...state, notice: 'Both legs cannot go in the same hole. Pick another.' };
      }

      const placement = {
        id: makeId(state.pending.type),
        type: state.pending.type,
        holes: [state.pending.firstHole, action.hole],
        state: state.pending.type === 'switch' ? { closed: false } : {},
      };
      return commit([...state.placements, placement]);
    }

    case 'cancel':
      return { ...state, pending: null, notice: null };

    case 'remove':
      return commit(state.placements.filter((placement) => placement.id !== action.id));

    case 'toggleSwitch':
      return {
        ...state,
        placements: state.placements.map((placement) =>
          placement.id === action.id && placement.type === 'switch'
            ? { ...placement, state: { ...placement.state, closed: !placement.state?.closed } }
            : placement,
        ),
        notice: null,
      };

    case 'undo': {
      if (state.history.length === 0) return { ...state, pending: null };
      const previous = state.history[state.history.length - 1];
      return {
        ...state,
        placements: previous,
        history: state.history.slice(0, -1),
        pending: null,
        notice: null,
      };
    }

    case 'reset':
      return initialState(action.level);

    case 'revealHint':
      return { ...state, hintsRevealed: Math.min(state.hintsRevealed + 1, action.total) };

    default:
      return state;
  }
}

/**
 * @param {Level} level
 */
export function useGameState(level) {
  const [state, rawDispatch] = useReducer(reducer, level, initialState);

  // Actions that need the level get it injected here, so callers never have to
  // remember to pass it.
  const dispatch = useCallback(
    (action) => rawDispatch({ ...action, level, total: level.hints.length }),
    [level],
  );

  // Escape always cancels whatever you were in the middle of.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dispatch({ type: 'cancel' });
      if ((event.key === 'z' || event.key === 'Z') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        dispatch({ type: 'undo' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  const context = useMemo(() => simulateAll(state.placements), [state.placements]);

  const objectives = useMemo(
    () => level.objectives.map((objective) => ({ ...objective, passed: objective.check(context) })),
    [level.objectives, context],
  );

  const won = objectives.length > 0 && objectives.every((objective) => objective.passed);

  return { state, dispatch, context, objectives, won };
}
