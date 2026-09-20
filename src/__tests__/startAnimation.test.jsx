import { describe, expect, it, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App.jsx';
import { START_RUN_MS } from '../menu/MainMenu.jsx';

vi.mock('../breadboard/useImageAvailable.js', () => ({
  useImageAvailable: (src) => (src.includes('mouse-sprite') ? true : false),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Start game animation and paw cursor', () => {
  it('runs the mouse into the house, then opens Level 1', () => {
    vi.useFakeTimers();
    render(<App />);
    const start = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(start);

    expect(document.querySelector('.mouse-runner--running')).toBeTruthy();
    expect(start.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: /how to play/i }).disabled).toBe(true);
    expect(screen.queryByText(/Home\. It took longer/i)).toBeNull();

    fireEvent.click(start); // a second press does not double-start
    act(() => vi.advanceTimersByTime(START_RUN_MS));
    expect(screen.getByText(/Home\. It took longer/i)).toBeTruthy();
  });

  it('closes the paw while a pointer button is held', () => {
    render(<App />);
    expect(document.body.classList.contains('paw-pressed')).toBe(false);
    fireEvent.pointerDown(window);
    expect(document.body.classList.contains('paw-pressed')).toBe(true);
    fireEvent.pointerUp(window);
    expect(document.body.classList.contains('paw-pressed')).toBe(false);
  });
});
