/**
 * OWNER: Person C (Game Shell & Story)
 *
 * The title screen. Ported from the standalone Menu prototype (menu-index.html
 * / styles.css) so the game opens on it: "Watt's Wrong?", Start game, How to
 * play, and a level list so returning players can skip ahead. Start game sends
 * the mouse running into the house first (from the paw-cursor branch), then
 * opens Level 1.
 *
 * The background image is optional — drop it at MENU_BACKGROUND and it appears;
 * otherwise a plain gradient stands in.
 */

import { useEffect, useRef, useState } from 'react';
import { useImageAvailable } from '../breadboard/useImageAvailable.js';
import { getStory } from '../story/index.js';
import './MainMenu.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const MENU_BACKGROUND = `${BASE}/assets/menu-background-pixel.png`;
export const MOUSE_SPRITE = `${BASE}/assets/mouse-sprite.png`;
/** Length of the mouse-runs-into-the-house animation; matches MainMenu.css. */
export const START_RUN_MS = 2700;

/**
 * @param {object} props
 * @param {import('../shared/types.js').Level[]} props.levels
 * @param {(index: number) => void} props.onStart  index of the level to play
 */
export function MainMenu({ levels, onStart }) {
  const [showHelp, setShowHelp] = useState(false);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);
  const hasBackground = useImageAvailable(MENU_BACKGROUND) === true;
  const hasMouse = useImageAvailable(MOUSE_SPRITE) === true;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function startGame() {
    if (running) return;
    if (!hasMouse) {
      onStart(0);
      return;
    }
    setRunning(true);
    timer.current = window.setTimeout(() => onStart(0), START_RUN_MS);
  }

  return (
    <section
      className={`menu-screen${running ? ' menu-screen--running' : ''}`}
      aria-labelledby="game-title"
      data-background={hasBackground}
      style={hasBackground ? { backgroundImage: `url("${MENU_BACKGROUND}")` } : undefined}
    >
      {hasMouse && (
        <img
          className={`mouse-runner${running ? ' mouse-runner--running' : ''}`}
          src={MOUSE_SPRITE}
          alt=""
          aria-hidden="true"
        />
      )}
      <div className="menu-card">
        <p className="menu-kicker">An electronics adventure</p>
        <h1 id="game-title">
          <span>Watt’s</span> Wrong?
        </h1>

        <div className="menu-actions">
          <button
            type="button"
            className="menu-primary"
            aria-disabled={running || undefined}
            onClick={startGame}
          >
            Start game <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="menu-secondary"
            aria-disabled={running || undefined}
            disabled={running}
            aria-expanded={showHelp}
            aria-controls="menu-instructions"
            onClick={() => setShowHelp((open) => !open)}
          >
            How to play
          </button>
        </div>

        {showHelp && (
          <div id="menu-instructions" className="menu-instructions">
            Drag a part out of the tray and drop it on the breadboard. Build a complete loop from
            the battery’s + back to its −, then click the switch to light the LED. Drag a placed
            part to move it, or drag it off the board to take it away.
          </div>
        )}

        <nav className="menu-levels" aria-label="Choose a level">
          <p className="menu-level">Or jump to a level</p>
          <ol className="menu-levels__list">
            {levels.map((level, index) => (
              <li key={level.id}>
                <button
                  type="button"
                  className="menu-levels__item"
                  disabled={running}
                  onClick={() => onStart(index)}
                >
                  <span className="menu-levels__num">{index + 1}</span>
                  <span className="menu-levels__title">
                    {getStory(level.id)?.title ?? level.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
