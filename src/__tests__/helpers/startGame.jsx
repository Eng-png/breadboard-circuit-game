import { fireEvent, render, screen } from '@testing-library/react';
import App from '../../App.jsx';

/**
 * Render the app, press "Start game" on the title screen, and click past the
 * intro slides. Leaves you on the first story beat, which is where every
 * playthrough test wants to begin.
 */
export function startGame() {
  const view = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /start game/i }));
  skipIntro();
  return view;
}

/** Click through however many intro slides there are. */
export function skipIntro() {
  for (let guard = 0; guard < 10; guard += 1) {
    const slide = document.querySelector('.intro-slide');
    if (!slide) return;
    fireEvent.click(slide);
  }
  throw new Error('The intro slides never ended');
}
