/**
 * OWNER: Person D (art) / Person C (the circuit link)
 *
 * The desk fan standing in the room. It is drawn from five frames of the head
 * at different angles (public/assets/props/fan/). While the fan motor on the
 * board is turning the head steps through them, one frame per tick; `speed`
 * (0..1) is how fast. At 0 it simply stops on whatever frame it reached, the
 * way a real fan winds down and stays put.
 *
 * Where it goes at the ends is up to `limits` — see fanSweep.js. With no limit
 * switch at an end the head runs into it and stalls there; with one, the
 * switch is pressed (`onHit(side)`) and the head turns back.
 *
 * Like every other prop the frames are optional: with no images on disk the
 * fan renders nothing, and the level still plays through on the board alone.
 */

import { forwardRef, useEffect, useRef, useState } from 'react';
import { useImageAvailable } from '../breadboard/useImageAvailable.js';
import { FAN_FRAMES, FAN_REF_WIDTH } from '../content/assets.js';
import { START, frameInterval, stepSweep } from './fanSweep.js';

const NO_LIMITS = { left: false, right: false };

/**
 * @param {object} props
 * @param {number} props.speed 0 (stopped) .. 1 (full)
 * @param {{ left: boolean, right: boolean }} [props.limits]  Ends with a limit switch
 * @param {(side: 'left' | 'right') => void} [props.onHit]  A limit switch was pressed
 */
export const FanProp = forwardRef(function FanProp(
  { speed, limits = NO_LIMITS, onHit },
  ref,
) {
  const hasArt = useImageAvailable(FAN_FRAMES[0].src) === true;
  const [sweep, setSweep] = useState(START);
  const sweepRef = useRef(sweep);
  useEffect(() => {
    sweepRef.current = sweep;
  }, [sweep]);
  const { left, right } = limits;

  // A switch arriving at the end the head is stuck against gets it moving again.
  const stalled = sweep.stalled && !limits[sweep.dir > 0 ? 'left' : 'right'];
  const turning = speed > 0 && !stalled;

  useEffect(() => {
    if (!turning) return undefined;
    const id = window.setInterval(() => {
      const { state, hit } = stepSweep(sweepRef.current, { left, right });
      sweepRef.current = state;
      setSweep(state);
      if (hit && onHit) onHit(hit);
    }, frameInterval(speed));
    return () => window.clearInterval(id);
  }, [turning, speed, left, right, onHit]);

  if (!hasArt) return null;

  return (
    <div
      ref={ref}
      className="fan-prop"
      data-spinning={turning}
      data-stalled={speed > 0 && stalled}
      data-frame={sweep.frame + 1}
      aria-hidden="true"
    >
      {/* Every frame stays mounted so switching is instant, with no flicker while a PNG loads. */}
      {FAN_FRAMES.map(({ src, width, height, anchor: [ax, ay] }, index) => (
        <img
          key={src}
          className="fan-prop__frame"
          src={src}
          alt=""
          draggable="false"
          style={{
            opacity: index === sweep.frame ? 1 : 0,
            // Same scale for every frame; base bottom-centre pinned to the box's bottom centre.
            width: `${(width / FAN_REF_WIDTH) * 100}%`,
            transform: `translate(${(-ax / width) * 100}%, ${((height - ay) / height) * 100}%)`,
          }}
        />
      ))}
    </div>
  );
});
