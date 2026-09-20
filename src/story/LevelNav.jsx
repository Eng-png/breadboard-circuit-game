/**
 * OWNER: Person C (Game Shell & Story)
 *
 * Jump between levels from the story header. Every level is open — this is a
 * teaching game, not a grind, and a teacher needs to be able to start a class
 * on Level 2 without playing Level 1 first.
 */

import { getStory } from './index.js';

/**
 * @param {object} props
 * @param {import('../shared/types.js').Level[]} props.levels
 * @param {number} props.current  index into levels
 * @param {(index: number) => void} props.onSelect
 * @param {() => void} [props.onMenu]  back to the title screen
 */
export function LevelNav({ levels, current, onSelect, onMenu }) {
  return (
    <nav className="level-nav" aria-label="Levels">
      {onMenu && (
        <button type="button" className="level-nav__menu" onClick={onMenu}>
          ← Menu
        </button>
      )}
      <span className="level-nav__label">Levels</span>
      <ol className="level-nav__list">
        {levels.map((level, index) => {
          const chapter = getStory(level.id)?.chapter ?? `Level ${index + 1}`;
          const active = index === current;
          return (
            <li key={level.id}>
              <button
                type="button"
                className="level-nav__item"
                aria-current={active ? 'page' : undefined}
                aria-label={`${chapter}: ${level.title}`}
                title={level.title}
                onClick={() => {
                  if (!active) onSelect(index);
                }}
              >
                {index + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
