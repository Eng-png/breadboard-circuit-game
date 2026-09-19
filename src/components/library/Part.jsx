/**
 * OWNER: Person D (art) — working placeholder art, replace freely.
 *
 * Renders one placed component between its two holes. Everything is drawn in
 * board millimetres, inside the breadboard's own SVG, so one hole pitch is 2.54.
 *
 * The visual job of this file is to make three things unmistakable at a glance:
 *   - which way round a polarized part goes (the LED lesson)
 *   - whether a switch is open or closed
 *   - whether the LED is lit, dark, or burnt out
 *
 * Person D: keep those three readable and the rest is yours to prettify.
 */

import { holeCenter } from '../../breadboard/geometry.js';

/** @typedef {import('../../shared/types.js').Placement} Placement */
/** @typedef {import('../../shared/types.js').PlacementResult} PlacementResult */

/**
 * @param {object} props
 * @param {Placement} props.placement
 * @param {PlacementResult} [props.result]
 * @param {boolean} [props.faulted]
 * @param {(id: string) => void} [props.onActivate]
 */
export function Part({ placement, result, faulted = false, onActivate }) {
  const from = holeCenter(placement.holes[0]);
  const to = holeCenter(placement.holes[1]);
  if (!from || !to) return null;

  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

  const className = [
    'part',
    `part--${placement.type}`,
    faulted ? 'part--faulted' : '',
    result?.energized ? 'part--energized' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = onActivate
    ? (event) => {
        event.stopPropagation();
        onActivate(placement.id);
      }
    : undefined;

  if (placement.type === 'wire') {
    return (
      <g className={className} data-placement={placement.id} onClick={handleClick}>
        <path d={sag(from, to)} className="part__wire" stroke={wireColour(placement)} />
        <path d={sag(from, to)} className="part__hit" />
      </g>
    );
  }

  return (
    <g className={className} data-placement={placement.id} onClick={handleClick}>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="part__lead" />
      <g transform={`translate(${mid.x} ${mid.y}) rotate(${angle})`}>
        <Body placement={placement} result={result} />
      </g>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="part__hit" />
    </g>
  );
}

function Body({ placement, result }) {
  switch (placement.type) {
    case 'battery':
      return (
        <>
          <rect x="-5" y="-2.6" width="10" height="5.2" rx="0.8" className="part__battery" />
          <text className="part__text" x="0" y="0.9">9V</text>
          <text className="part__pole part__pole--pos" x="-6.4" y="0.9">+</text>
          <text className="part__pole part__pole--neg" x="6.4" y="0.9">&#8722;</text>
        </>
      );

    case 'resistor':
      return (
        <>
          <rect x="-3.4" y="-1.2" width="6.8" height="2.4" rx="1.1" className="part__resistor" />
          {/* 330 ohm: orange, orange, brown, gold */}
          <rect x="-2.2" y="-1.2" width="0.6" height="2.4" fill="#e07b22" />
          <rect x="-1.1" y="-1.2" width="0.6" height="2.4" fill="#e07b22" />
          <rect x="0.0" y="-1.2" width="0.6" height="2.4" fill="#7a4a1e" />
          <rect x="2.2" y="-1.2" width="0.5" height="2.4" fill="#c9a227" />
        </>
      );

    case 'led': {
      const lit = result?.lit === true;
      const dead = result?.burnedOut === true;
      return (
        <>
          {/* Flat side marks the cathode, exactly as on a real LED. */}
          <path
            d="M -1.9 -1.9 A 1.9 1.9 0 0 1 -1.9 1.9 L 1.9 1.9 L 1.9 -1.9 Z"
            className="part__led"
            data-lit={lit}
            data-dead={dead}
          />
          {lit && <circle r="4.2" className="part__glow" />}
          <text className="part__pole part__pole--pos" x="-3.6" y="0.8">+</text>
        </>
      );
    }

    case 'switch': {
      const closed = placement.state?.closed === true;
      return (
        <>
          <rect x="-3.6" y="-2.2" width="7.2" height="4.4" rx="0.7" className="part__switch" />
          <circle cx="-2.2" cy="0" r="0.5" className="part__terminal" />
          <circle cx="2.2" cy="0" r="0.5" className="part__terminal" />
          <line
            x1="-2.2"
            y1="0"
            x2={closed ? 2.2 : 1.0}
            y2={closed ? 0 : -1.5}
            className="part__lever"
            data-closed={closed}
          />
        </>
      );
    }

    default:
      return <rect x="-3" y="-1.5" width="6" height="3" className="part__unknown" />;
  }
}

/** A jumper wire arcs rather than lying flat. The arc is what makes crossings readable. */
function sag(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const lift = Math.min(length * 0.18, 6);
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 - lift;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

/**
 * Colour-code by what the wire touches: red for a positive rail, blue for
 * negative, green for everything else. That is the convention on every real
 * bench, and it is free teaching.
 */
function wireColour(placement) {
  const touches = (prefixes) =>
    placement.holes.some((hole) => prefixes.some((prefix) => hole?.startsWith(prefix)));
  if (touches(['TP', 'BP'])) return 'var(--rail-positive)';
  if (touches(['TN', 'BN'])) return 'var(--rail-negative)';
  return 'var(--wire-neutral, #2f9e64)';
}
