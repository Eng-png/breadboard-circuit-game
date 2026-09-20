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
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
      release();
    };
  }, []);
}
