/**
 * OWNER: Person C (interaction)
 *
 * Two limit switches loose in the room. Unlike every board part they do not
 * live on the breadboard and do not snap to holes: the player drags each one
 * anywhere in the scene and it stays exactly where it was dropped. What
 * matters is whether it was dropped *at an end of the fan's sweep* — the zone
 * just beside the head on the left or the right, where the head will press it.
 *
 * Positions are percentages of the scene box so they survive a resize.
 *
 * Keyboard path: focus a switch, press Enter/Space to move it to the next end
 * (left → right → back to the floor), Delete to put it back on the floor.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** @typedef {'left' | 'right'} Side */

/**
 * @typedef {object} LimitSwitch
 * @property {string} id
 * @property {number} x  0..100, percent of the scene width, switch centre
 * @property {number} y  0..100, percent of the scene height, switch centre
 * @property {Side | null} side  The fan end it is guarding, if any
 */

/** Where the two switches start: on the floor, in front of the fan. */
const START_POSITIONS = [
  { id: 'switch-a', x: 62, y: 92, side: null },
  { id: 'switch-b', x: 72, y: 92, side: null },
];

/** How long a pressed switch stays lit, ms. */
export const HIT_FLASH_MS = 350;

/**
 * Which end of the fan a point sits at, if any. The zones are the strip
 * either side of the head, as wide as half the fan and as tall as its top
 * two-thirds — generous, because the art is chunky and the player is aiming
 * with a paw.
 *
 * @param {{ x: number, y: number }} point  Client coordinates
 * @param {DOMRect | null | undefined} fan   The fan prop's box
 * @returns {Side | null}
 */
export function sideAt(point, fan) {
  if (!fan || fan.width === 0) return null;
  const top = fan.top - fan.height * 0.15;
  const bottom = fan.top + fan.height * 0.7;
  if (point.y < top || point.y > bottom) return null;
  if (point.x >= fan.left - fan.width * 0.5 && point.x <= fan.left + fan.width * 0.3) return 'left';
  if (point.x <= fan.right + fan.width * 0.5 && point.x >= fan.right - fan.width * 0.3) return 'right';
  return null;
}

/**
 * @param {import('react').RefObject<HTMLElement | null>} sceneRef  The box positions are relative to
 * @param {import('react').RefObject<HTMLElement | null>} fanRef    The fan prop
 */
export function useLimitSwitches(sceneRef, fanRef) {
  const [switches, setSwitches] = useState(START_POSITIONS);
  const [drag, setDrag] = useState(/** @type {{ id: string, dx: number, dy: number } | null} */ (null));
  const [hit, setHit] = useState(/** @type {Side | null} */ (null));
  const flashTimer = useRef(0);

  /** Percent-of-scene for a client point. */
  const toScene = useCallback(
    (clientX, clientY) => {
      const box = sceneRef.current?.getBoundingClientRect();
      if (!box || box.width === 0) return { x: 0, y: 0 };
      return {
        x: Math.max(0, Math.min(100, ((clientX - box.left) / box.width) * 100)),
        y: Math.max(0, Math.min(100, ((clientY - box.top) / box.height) * 100)),
      };
    },
    [sceneRef],
  );

  const beginDrag = useCallback((id, event) => {
    event.preventDefault();
    const target = event.currentTarget.getBoundingClientRect();
    const cx = target.left + target.width / 2;
    const cy = target.top + target.height / 2;
    setDrag({ id, dx: event.clientX - cx, dy: event.clientY - cy });
  }, []);

  useEffect(() => {
    if (!drag) return undefined;

    const centre = (event) => ({ x: event.clientX - drag.dx, y: event.clientY - drag.dy });

    const onMove = (event) => {
      const c = centre(event);
      const { x, y } = toScene(c.x, c.y);
      setSwitches((all) => all.map((s) => (s.id === drag.id ? { ...s, x, y, side: null } : s)));
    };
    const onUp = (event) => {
      const c = centre(event);
      const { x, y } = toScene(c.x, c.y);
      const side = sideAt(c, fanRef.current?.getBoundingClientRect());
      setSwitches((all) => all.map((s) => (s.id === drag.id ? { ...s, x, y, side } : s)));
      setDrag(null);
    };
    const onCancel = () => setDrag(null);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [drag, toScene, fanRef]);

  /**
   * Keyboard: put the switch at an end (or back on the floor) without a pointer.
   * @param {string} id
   * @param {Side | null} side
   */
  const placeAt = useCallback(
    (id, side) => {
      const fan = fanRef.current?.getBoundingClientRect();
      const start = START_POSITIONS.find((s) => s.id === id) ?? START_POSITIONS[0];
      let x = start.x;
      let y = start.y;
      if (side && fan && fan.width > 0) {
        const clientX = side === 'left' ? fan.left - fan.width * 0.1 : fan.right + fan.width * 0.1;
        const clientY = fan.top + fan.height * 0.3;
        ({ x, y } = toScene(clientX, clientY));
      }
      setSwitches((all) => all.map((s) => (s.id === id ? { ...s, x, y, side } : s)));
    },
    [fanRef, toScene],
  );

  const onHit = useCallback((side) => {
    setHit(side);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setHit(null), HIT_FLASH_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const limits = useMemo(
    () => ({
      left: switches.some((s) => s.side === 'left'),
      right: switches.some((s) => s.side === 'right'),
    }),
    [switches],
  );

  return { switches, dragging: drag?.id ?? null, beginDrag, placeAt, limits, hit, onHit };
}
