/**
 * OWNER: Person D (art + copy) / Person C (shell)
 *
 * The slides between pressing start and the story starting. One at a time,
 * click anywhere to move on — it is a whole-screen button, so a tap, a click
 * and the Enter key all work and a screen reader announces what is on it.
 *
 * Add a slide by adding to INTRO_SLIDES in content/assets.js. With the list
 * empty this renders nothing and the game goes straight to the story.
 */

import { useState } from 'react';
import { INTRO_SLIDES } from '../content/assets.js';

/**
 * @param {object} props
 * @param {{ src: string, alt: string }[]} [props.slides]
 * @param {() => void} props.onDone  Called after the last slide is dismissed
 */
export function IntroSlides({ slides = INTRO_SLIDES, onDone }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  if (!slide) return null;

  const last = index === slides.length - 1;

  return (
    <button
      type="button"
      className="intro-slide"
      onClick={() => (last ? onDone() : setIndex(index + 1))}
    >
      <img className="intro-slide__image" src={slide.src} alt={slide.alt} />
      <span className="intro-slide__hint">
        {last ? 'Click to begin' : 'Click to continue'}
      </span>
    </button>
  );
}
