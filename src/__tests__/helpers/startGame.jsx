import { fireEvent, render, screen } from '@testing-library/react';
import App from '../../App.jsx';

/** Render the app and press "Start game" on the title screen. */
export function startGame() {
  const view = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /start game/i }));
  return view;
}
