/**
 * OWNER: Person C (behaviour) / Person D (art + copy)
 *
 * The parts bin. Click a part to arm it, then click two holes on the board.
 *
 * Person D: the blurb under each part is where most of the teaching actually
 * lands, so it stays visible rather than hiding in a tooltip.
 */

import { getComponent } from '../content/components.js';
import { remainingOf } from '../game/useGameState.js';

/**
 * @param {object} props
 * @param {import('../shared/types.js').Level} props.level
 * @param {import('../shared/types.js').Placement[]} props.placements
 * @param {{ type: string, firstHole: string | null } | null} props.pending
 * @param {(type: string) => void} props.onArm
 */
export function Tray({ level, placements, pending, onArm }) {
  return (
    <section className="panel tray">
      <h2>Parts</h2>
      <ul className="tray__list">
        {level.tray.map((item) => {
          const def = getComponent(item.type);
          const left = remainingOf(level, placements, item.type);
          const exhausted = left <= 0;
          const armed = pending?.type === item.type;

          return (
            <li key={item.type}>
              <button
                type="button"
                className="tray__item"
                data-part={item.type}
                data-armed={armed}
                disabled={exhausted}
                aria-pressed={armed}
                onClick={() => onArm(item.type)}
              >
                <span className="tray__head">
                  <span className="tray__label">{def.label}</span>
                  <span className="tray__count">{left === Infinity ? '∞' : left}</span>
                </span>
                <span className="tray__blurb">{def.blurb}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="tray__how">
        {pending?.firstHole
          ? 'Now click the hole for the second leg.'
          : pending
            ? 'Click a hole for the first leg. Escape to cancel.'
            : 'Click a part, then click two holes on the board.'}
      </p>
    </section>
  );
}
