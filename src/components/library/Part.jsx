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

import { useRef } from 'react';
import { holeCenter } from '../../breadboard/geometry.js';
import { useImageAvailable } from '../../breadboard/useImageAvailable.js';
import { COMPONENT_ART } from '../../content/assets.js';

/** @typedef {import('../../shared/types.js').Placement} Placement */
/** @typedef {import('../../shared/types.js').PlacementResult} PlacementResult */

/**
 * @param {object} props
 * @param {Placement} props.placement
 * @param {PlacementResult} [props.result]
 * @param {boolean} [props.faulted]
 * @param {(id: string) => void} [props.onActivate]
 * @param {(id: string, turn: number) => void} [props.onTurn]
 */
export function Part({ placement, result, faulted = false, onActivate, onTurn }) {
  const drag = useKnobDrag(placement, onTurn);
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
        if (drag.consumedClick()) return;
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
    <g
      className={className}
      data-placement={placement.id}
      onClick={handleClick}
      {...drag.handlers}
    >
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

    case 'potentiometer':
      return <Potentiometer placement={placement} />;

    case 'led': {
      const lit = result?.lit === true;
      const dead = result?.burnedOut === true;
      const brightness = lit ? (result?.brightness ?? 1) : 0;
      return (
        <>
          {/* Flat side marks the cathode, exactly as on a real LED. */}
          <path
            d="M -1.9 -1.9 A 1.9 1.9 0 0 1 -1.9 1.9 L 1.9 1.9 L 1.9 -1.9 Z"
            className="part__led"
            data-lit={lit}
            data-dead={dead}
            style={lit ? { fillOpacity: 0.55 + 0.45 * brightness } : undefined}
          />
          {lit && (
            <circle
              r={2.6 + 1.6 * brightness}
              className="part__glow"
              style={{ opacity: 0.08 + 0.2 * brightness }}
            />
          )}
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

/**
 * A potentiometer: a square body with a dial whose pointer follows the knob.
 * When the real artwork exists at COMPONENT_ART.potentiometer.src it replaces
 * the drawn body; the dial pointer stays on top so the setting is still readable.
 */
function Potentiometer({ placement }) {
  const art = COMPONENT_ART.potentiometer;
  const hasArt = useImageAvailable(art.src) === true;
  const turn = Math.min(1, Math.max(0, placement.state?.turn ?? 0));
  // Sweep the pointer through 270 degrees, from 7 o'clock round to 5 o'clock.
  const angle = -135 + turn * 270;

  return (
    <g className="part__pot" data-turn={turn.toFixed(2)}>
      {hasArt ? (
        <image
          href={art.src}
          x={-art.width / 2}
          y={-art.height / 2}
          width={art.width}
          height={art.height}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <>
          <rect x="-4.2" y="-4.2" width="8.4" height="8.4" rx="1" className="part__pot-body" />
          <circle r="2.9" className="part__pot-dial" />
        </>
      )}
      <g transform={`rotate(${angle})`}>
        <line x1="0" y1="0" x2="0" y2="-2.5" className="part__pot-pointer" />
      </g>
    </g>
  );
}

/** Screen pixels of vertical drag that sweep the knob from one end to the other. */
const KNOB_DRAG_PX = 160;
/** Movement under this many pixels is a click (remove the part), not a drag. */
const KNOB_CLICK_SLOP_PX = 4;

/**
 * Drag a potentiometer up to brighten it (less resistance) and down to dim it.
 * A short press that does not move still counts as a click so the part can be
 * taken off the board like everything else.
 */
function useKnobDrag(placement, onTurn) {
  const ref = useRef({ down: false, startY: 0, startTurn: 0, moved: false, dragged: false });
  const active = placement.type === 'potentiometer' && typeof onTurn === 'function';

  if (!active) return { handlers: {}, consumedClick: () => false };

  const handlers = {
    onPointerDown(event) {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      ref.current = {
        down: true,
        startY: event.clientY,
        startTurn: placement.state?.turn ?? 0,
        moved: false,
        dragged: false,
      };
    },
    onPointerMove(event) {
      if (!ref.current.down) return;
      const dy = event.clientY - ref.current.startY;
      if (!ref.current.moved && Math.abs(dy) < KNOB_CLICK_SLOP_PX) return;
      ref.current.moved = true;
      const turn = Math.min(1, Math.max(0, ref.current.startTurn + dy / KNOB_DRAG_PX));
      onTurn(placement.id, turn);
    },
    onPointerUp(event) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      ref.current.down = false;
      ref.current.dragged = ref.current.moved;
    },
    onPointerCancel() {
      ref.current.down = false;
      ref.current.dragged = ref.current.moved;
    },
  };

  return {
    handlers,
    consumedClick: () => {
      const dragged = ref.current.dragged;
      ref.current.dragged = false;
      return dragged;
    },
  };
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
