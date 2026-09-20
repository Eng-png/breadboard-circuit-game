/**
 * OWNER: Person D (art) / Person C (the circuit link)
 *
 * The desk fan standing in the room. It is drawn from five frames of the head
 * at different angles (public/assets/props/fan/), and while the fan motor on
 * the board is turning it sweeps through them right → left → right, like an
 * oscillating fan. `speed` (0..1) is how fast it sweeps; at 0 it simply stops
 * on whatever frame it reached, the way a real fan winds down and stays put.
 *
 * Like every other prop the frames are optional: with no images on disk the
 * fan renders nothing, and the level still plays through on the board alone.
 */

import { useEffect, useState } from 'react';
import { useImageAvailable } from '../breadboard/useImageAvailable.js';
import { FAN_FRAMES, FAN_REF_WIDTH } from '../content/assets.js';
import { SWEEP, frameInterval } from './fanSweep.js';

/**
 * @param {object} props
 * @param {number} props.speed 0 (stopped) .. 1 (full)
 */
export function FanProp({ speed }) {
  const hasArt = useImageAvailable(FAN_FRAMES[0].src) === true;
  const [step, setStep] = useState(0);
  const spinning = speed > 0;

  useEffect(() => {
    if (!spinning) return undefined;
    const id = window.setInterval(
      () => setStep((current) => (current + 1) % SWEEP.length),
      frameInterval(speed),
    );
    return () => window.clearInterval(id);
  }, [spinning, speed]);

  if (!hasArt) return null;

  const frame = SWEEP[step];
  return (
    <div className="fan-prop" data-spinning={spinning} data-frame={frame + 1} aria-hidden="true">
      {/* Every frame stays mounted so switching is instant, with no flicker while a PNG loads. */}
      {FAN_FRAMES.map(({ src, width, height, anchor: [ax, ay] }, index) => (
        <img
          key={src}
          className="fan-prop__frame"
          src={src}
          alt=""
          draggable="false"
          style={{
            opacity: index === frame ? 1 : 0,
            // Same scale for every frame; base bottom-centre pinned to the box's bottom centre.
            width: `${(width / FAN_REF_WIDTH) * 100}%`,
            transform: `translate(${(-ax / width) * 100}%, ${((height - ay) / height) * 100}%)`,
          }}
        />
      ))}
    </div>
  );
}
