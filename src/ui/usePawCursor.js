/**
 * OWNER: Person D (Content, Theme & Accessibility)
 *
 * Toggles `paw-pressed` on <body> while a pointer button is held, so the paw
 * cursor in index.css closes on press and opens on release.
 */

import { useEffect } from 'react';

export function usePawCursor() {
  useEffect(() => {
    const press = () => document.body.classList.add('paw-pressed');
    const release = () => document.body.classList.remove('paw-pressed');
    // Capture phase: parts stop propagation of pointerdown to own their drags.
    window.addEventListener('pointerdown', press, true);
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('pointerdown', press, true);
      window.removeEventListener('pointerup', release, true);
      window.removeEventListener('pointercancel', release, true);
      window.removeEventListener('blur', release);
      release();
    };
  }, []);
}
