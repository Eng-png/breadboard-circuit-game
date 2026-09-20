/**
 * OWNER: Person D (art) / Person C (interaction)
 *
 * The two limit switches in the room: a small block with a lever arm and two
 * wires trailing off it towards the Arduino. Draggable anywhere in the scene
 * (see useLimitSwitches.js) — they never snap to the board.
 *
 * Drawn from public/assets/props/limit-switch.png when it exists, otherwise
 * from the SVG placeholder below.
 */

import { useImageAvailable } from '../breadboard/useImageAvailable.js';
import { LIMIT_SWITCH_IMAGE } from '../content/assets.js';

const SIDE_LABEL = { left: 'at the left end of the fan', right: 'at the right end of the fan' };

/**
 * @param {object} props
 * @param {import('./useLimitSwitches.js').LimitSwitch[]} props.switches
 * @param {string | null} props.dragging   id of the switch under the pointer
 * @param {(id: string, event: import('react').PointerEvent) => void} props.onGrab
 * @param {(id: string, side: 'left' | 'right' | null) => void} props.onPlace
 * @param {'left' | 'right' | null} props.hit   The end whose switch is being pressed right now
 */
export function LimitSwitches({ switches, dragging, onGrab, onPlace, hit }) {
  const hasArt = useImageAvailable(LIMIT_SWITCH_IMAGE) === true;

  const onKeyDown = (sw, event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPlace(sw.id, sw.side === null ? 'left' : sw.side === 'left' ? 'right' : null);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      onPlace(sw.id, null);
    }
  };

  return (
    <>
      {switches.map((sw, index) => {
        const pressed = sw.side !== null && sw.side === hit;
        const where = sw.side ? SIDE_LABEL[sw.side] : 'on the floor';
        return (
          <button
            key={sw.id}
            type="button"
            className="limit-switch"
            data-side={sw.side ?? 'none'}
            data-pressed={pressed}
            data-dragging={dragging === sw.id}
            style={{ left: `${sw.x}%`, top: `${sw.y}%` }}
            aria-label={`Limit switch ${index + 1}, ${where}. Drag it to an end of the fan, or press Enter to move it to the next end.`}
            onPointerDown={(event) => onGrab(sw.id, event)}
            onKeyDown={(event) => onKeyDown(sw, event)}
          >
            {hasArt ? (
              <img
                src={LIMIT_SWITCH_IMAGE}
                alt=""
                draggable="false"
                style={sw.side === 'right' ? { transform: 'scaleX(-1)' } : undefined}
              />
            ) : (
              <Placeholder pressed={pressed} flip={sw.side === 'right'} />
            )}
          </button>
        );
      })}
    </>
  );
}

/** A micro switch: body, button, lever arm, two wires off the back. */
function Placeholder({ pressed, flip }) {
  return (
    <svg viewBox="0 0 64 48" className="limit-switch__art" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      {/* wires */}
      <path className="limit-switch__wire" d="M 12 30 C 4 30, 2 42, 6 47" />
      <path className="limit-switch__wire limit-switch__wire--alt" d="M 20 34 C 14 36, 10 44, 12 47" />
      {/* body */}
      <rect x="10" y="18" width="40" height="18" rx="2" className="limit-switch__body" />
      <circle cx="20" cy="27" r="2" className="limit-switch__screw" />
      <circle cx="40" cy="27" r="2" className="limit-switch__screw" />
      {/* button + lever */}
      <rect x="34" y={pressed ? 15 : 12} width="8" height="6" rx="1" className="limit-switch__button" />
      <path
        className="limit-switch__lever"
        d={pressed ? 'M 14 16 L 54 12' : 'M 14 16 L 54 4'}
      />
      <circle cx="54" cy={pressed ? 12 : 4} r="3" className="limit-switch__roller" />
    </svg>
  );
}
