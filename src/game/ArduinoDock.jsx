/**
 * OWNER: Person D (art) / Person C (the fan link)
 *
 * The little Arduino docked above the breadboard in Level 4. It is not wired
 * on the board — it reads the two limit switches and drives the fan the other
 * way when one is pressed. Two input lights show which end just spoke.
 *
 * Drawn from public/assets/props/arduino.png when it exists, otherwise from
 * the SVG placeholder below.
 */

import { useImageAvailable } from '../breadboard/useImageAvailable.js';
import { ARDUINO_IMAGE } from '../content/assets.js';

/**
 * @param {object} props
 * @param {{ left: boolean, right: boolean }} props.limits  Which inputs have a switch wired
 * @param {'left' | 'right' | null} props.hit                Input being pressed right now
 */
export function ArduinoDock({ limits, hit }) {
  const hasArt = useImageAvailable(ARDUINO_IMAGE) === true;
  const label =
    `Arduino. Left limit switch ${limits.left ? 'connected' : 'not connected'}, ` +
    `right limit switch ${limits.right ? 'connected' : 'not connected'}.`;

  return (
    <div className="arduino" role="img" aria-label={label} data-hit={hit ?? 'none'}>
      {hasArt ? (
        <img src={ARDUINO_IMAGE} alt="" draggable="false" />
      ) : (
        <svg viewBox="0 0 160 56" className="arduino__art">
          <rect x="1" y="1" width="158" height="54" rx="4" className="arduino__board" />
          <rect x="8" y="8" width="30" height="20" rx="1" className="arduino__usb" />
          <rect x="52" y="12" width="40" height="32" rx="1" className="arduino__chip" />
          <text x="72" y="31" className="arduino__text" textAnchor="middle">
            ARDUINO
          </text>
          <g className="arduino__pins">
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={100 + i * 4.5} y="4" width="2.5" height="6" />
            ))}
          </g>
          <circle cx="112" cy="38" r="4" className="arduino__led" data-on={hit === 'left'} data-wired={limits.left} />
          <text x="112" y="51" className="arduino__text arduino__text--small" textAnchor="middle">
            L
          </text>
          <circle cx="136" cy="38" r="4" className="arduino__led" data-on={hit === 'right'} data-wired={limits.right} />
          <text x="136" y="51" className="arduino__text arduino__text--small" textAnchor="middle">
            R
          </text>
        </svg>
      )}
    </div>
  );
}
