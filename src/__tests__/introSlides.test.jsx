import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IntroSlides } from '../story/IntroSlides.jsx';
import { INTRO_SLIDES } from '../content/assets.js';

/**
 * The slides between pressing start and the story. Held until clicked — the
 * player reads at their own pace, not on a timer.
 */

afterEach(cleanup);

describe('Intro slides', () => {
  it('shows the first slide and waits', () => {
    render(<IntroSlides onDone={() => {}} />);
    const image = document.querySelector('.intro-slide__image');
    expect(image.getAttribute('src')).toBe(INTRO_SLIDES[0].src);
    expect(image.getAttribute('alt')).toBe(INTRO_SLIDES[0].alt);
  });

  it('a click on the last slide finishes', () => {
    let done = false;
    render(<IntroSlides onDone={() => { done = true; }} />);

    // One click per slide, however many the game ships with.
    for (let i = 0; i < INTRO_SLIDES.length - 1; i += 1) {
      fireEvent.click(document.querySelector('.intro-slide'));
      expect(done).toBe(false);
    }

    fireEvent.click(document.querySelector('.intro-slide'));
    expect(done).toBe(true);
  });

  it('walks through several slides one click at a time', () => {
    let done = false;
    const slides = [
      { src: '/one.png', alt: 'one' },
      { src: '/two.png', alt: 'two' },
    ];
    render(<IntroSlides slides={slides} onDone={() => { done = true; }} />);

    expect(document.querySelector('.intro-slide__image').getAttribute('alt')).toBe('one');
    fireEvent.click(document.querySelector('.intro-slide'));

    expect(document.querySelector('.intro-slide__image').getAttribute('alt')).toBe('two');
    expect(done).toBe(false);

    fireEvent.click(document.querySelector('.intro-slide'));
    expect(done).toBe(true);
  });

  it('is a real button, so the keyboard gets through it too', () => {
    render(<IntroSlides slides={[{ src: '/one.png', alt: 'one' }]} onDone={() => {}} />);
    const slide = screen.getByRole('button');
    expect(slide.className).toContain('intro-slide');
    // Its name comes from the picture, so a screen reader describes the slide.
    expect(slide.textContent).toMatch(/click to begin/i);
  });

  it('renders nothing when there are no slides', () => {
    const { container } = render(<IntroSlides slides={[]} onDone={() => {}} />);
    expect(container.innerHTML).toBe('');
  });
});
