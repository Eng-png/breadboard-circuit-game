import { describe, expect, it, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { startGame } from './helpers/startGame.jsx';
import { resetIds } from '../shared/ids.js';
import { boardVisible, clickThrough, place, tap } from './boardActions.js';
import { FRAME_MS_FAST, SWEEP, frameInterval } from '../story/fanSweep.js';

/**
 * Plays level 4: jump to it from the level picker, wire the switch and the fan
 * into the gap, and watch the fan in the room sweep right → left → right while
 * — and only while — the one on the board is turning.
 */

// Only the fan frames "exist" on disk; everything else falls back to SVG.
vi.mock('../breadboard/useImageAvailable.js', () => ({
  useImageAvailable: (src) => src.includes('/props/fan/'),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function startLevel4() {
  resetIds();
  startGame();
  fireEvent.click(screen.getByRole('button', { name: /level 4/i }));
}

const roomFan = () => document.querySelector('.fan-prop');
const roomFrame = () => Number(roomFan().getAttribute('data-frame'));
const boardFan = () => document.querySelector('.breadboard .part__fan');
const switchNode = () => document.querySelector('[data-placement^="switch-"]');
const continueButton = () => screen.queryByRole('button', { name: /sit in front of it/i });

/** Wire switch + fan into the gap. The switch starts open. */
function buildLoop() {
  place('switch', 'A5', 'A9');
  place('fan', 'B9', 'B17');
}

describe('Level 4 — Fresh Air', () => {
  it('opens on a warm, lit room with a still fan, then a board with a gap', () => {
    startLevel4();
    expect(screen.getByText(/room, it turns out, is not/i)).toBeTruthy();
    expect(roomFan().getAttribute('data-spinning')).toBe('false');
    expect(roomFrame()).toBe(1);

    clickThrough(boardVisible);
    expect(Number(document.querySelector('.scene__veil').style.opacity)).toBeCloseTo(0.4);
    expect(document.querySelector('[data-placement="pre-feed"]')).toBeTruthy();
    expect(document.querySelector('[data-placement="pre-return"]')).toBeTruthy();
    expect(document.querySelector('[data-part="fan"]').disabled).toBe(false);
    expect(boardFan()).toBeNull();
  });

  it('spins the fan on the board and sweeps the one in the room when the switch closes', () => {
    vi.useFakeTimers();
    startLevel4();
    clickThrough(boardVisible);
    buildLoop();

    // Loop built, switch open: nothing moves.
    expect(boardFan().getAttribute('data-spinning')).toBe('false');
    expect(roomFan().getAttribute('data-spinning')).toBe('false');
    expect(continueButton()).toBeNull();

    tap(switchNode());
    expect(boardFan().getAttribute('data-spinning')).toBe('true');
    expect(roomFan().getAttribute('data-spinning')).toBe('true');
    // 9 V over 300 Ω = 30 mA = full speed, so frames tick at the fast rate.
    expect(frameInterval(1)).toBe(FRAME_MS_FAST);

    // Right → left through every frame…
    const seen = [roomFrame()];
    for (let i = 1; i < SWEEP.length; i += 1) {
      act(() => vi.advanceTimersByTime(FRAME_MS_FAST));
      seen.push(roomFrame());
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 4, 3, 2]);
    // …and back to the start: a loop, not a one-shot.
    act(() => vi.advanceTimersByTime(FRAME_MS_FAST));
    expect(roomFrame()).toBe(1);

    expect(continueButton()).toBeTruthy();
  });

  it('stops on the current frame when the switch opens again', () => {
    vi.useFakeTimers();
    startLevel4();
    clickThrough(boardVisible);
    buildLoop();
    tap(switchNode());
    act(() => vi.advanceTimersByTime(FRAME_MS_FAST * 3));
    expect(roomFrame()).toBe(4);

    tap(switchNode());
    expect(boardFan().getAttribute('data-spinning')).toBe('false');
    expect(roomFan().getAttribute('data-spinning')).toBe('false');
    act(() => vi.advanceTimersByTime(FRAME_MS_FAST * 10));
    expect(roomFrame()).toBe(4);
    expect(continueButton()).toBeNull();
  });

  it('turns slower with the resistor in series', () => {
    startLevel4();
    clickThrough(boardVisible);
    place('switch', 'A5', 'A9');
    place('resistor', 'B9', 'B13');
    place('fan', 'C13', 'C17');
    tap(switchNode());

    // 9 V over 630 Ω ≈ 14.3 mA: spinning, but well under full speed.
    expect(boardFan().getAttribute('data-spinning')).toBe('true');
    const duration = document.querySelector('.breadboard .part__fan-blades').style.animationDuration;
    expect(Number.parseFloat(duration)).toBeGreaterThan(1);
    expect(continueButton()).toBeTruthy();
  });

  it('does not count a fan outside the loop', () => {
    startLevel4();
    clickThrough(boardVisible);
    place('switch', 'A5', 'A9');
    place('wire', 'B9', 'B17');
    place('fan', 'F20', 'F25');
    tap(switchNode());

    expect(boardFan().getAttribute('data-spinning')).toBe('false');
    expect(screen.getByText(/joined \+ straight back to/i)).toBeTruthy();
    expect(continueButton()).toBeNull();
  });

  it('keeps the fan running through the ending', () => {
    vi.useFakeTimers();
    startLevel4();
    clickThrough(boardVisible);
    buildLoop();
    tap(switchNode());
    fireEvent.click(continueButton());

    expect(roomFan().getAttribute('data-spinning')).toBe('true');
    clickThrough(() => Boolean(screen.queryByText(/End of Level 4/i)));
    expect(roomFan().getAttribute('data-spinning')).toBe('true');
    expect(screen.getByText(/every level there is/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /continue to level 5/i })).toBeNull();
  });
});
