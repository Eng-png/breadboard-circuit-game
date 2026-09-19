/**
 * OWNER: Person C (behaviour) / Person D (art + copy)  — STUB.
 *
 * The parts bin. Shows what the level gives you and how many are left.
 *
 * TODO:
 *   - (C) Make items draggable; hand the drop off to Breadboard.
 *   - (C) Grey out an item at zero remaining.
 *   - (D) Swap the text placeholder for the real SVG part art.
 *   - (D) Show the blurb on hover/focus — this is where most of the teaching
 *         actually happens, so it should be readable, not a tooltip afterthought.
 */

import { getComponent } from '../content/components.js';

/**
 * @param {object} props
 * @param {import('../shared/types.js').Level} props.level
 * @param {import('../shared/types.js').Placement[]} props.placements
 */
export function Tray({ level, placements }) {
  return (
    <section className="tray">
      <h2>Parts</h2>
      <ul className="tray__list">
        {level.tray.map((item) => {
          const def = getComponent(item.type);
          const used = placements.filter((p) => p.type === item.type).length;
          const left = item.count === Infinity ? '∞' : item.count - used;
          return (
            <li key={item.type} className="tray__item">
              <span className="tray__label">{def.label}</span>
              <span className="tray__count">{left}</span>
              <p className="tray__blurb">{def.blurb}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
