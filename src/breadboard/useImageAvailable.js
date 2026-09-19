/**
 * OWNER: Person B
 *
 * Does this image actually exist? Used so the board can fall back to its drawn
 * self when the art has not landed yet.
 *
 * This is a legitimate effect: we are synchronising React with an external
 * system (the network), and the state update happens in a load callback rather
 * than synchronously during the effect.
 */

import { useEffect, useState } from 'react';

/**
 * @param {string} src
 * @returns {boolean | null} null while still checking
 */
export function useImageAvailable(src) {
  // Initialised from src so the "no source at all" case never needs an effect.
  const [available, setAvailable] = useState(() => (src ? null : false));

  useEffect(() => {
    if (!src) return undefined;

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setAvailable(true);
    };
    image.onerror = () => {
      if (!cancelled) setAvailable(false);
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return available;
}
