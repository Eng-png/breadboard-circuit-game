import { describe, expect, it, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { startGame } from './helpers/startGame.jsx';
import { resetIds } from '../shared/ids.js';
import { clickThrough } from './boardActions.js';
import { FAN_FRAMES } from '../content/assets.js';
import { FRAME_MS_FAST, FRAME_MS_SLOW, SWEEP, frameInterval } from '../story/fanSweep.js';

/**
 * Level 4 is, for now, a scene that shows the desk fan: still on the first
 * beat, sweeping right → left → right on the second.
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
const switchOn = () => fireEvent.click(screen.getByRole('button', { name: /switch it on/i }));

describe('Level 4 — Fresh Air (fan animation)', () => {
  it('ships five frames and a right→left→right sweep', () => {
    expect(FAN_FRAMES.map((f) => f.src)).toEqual([1, 2, 3, 4, 5].map((n) => `/assets/props/fan/fan-${n}.png`));
    expect(SWEEP).toEqual([0, 1, 2, 3, 4, 3, 2, 1]);
    expect(frameInterval(1)).toBe(FRAME_MS_FAST);
    expect(frameInterval(0)).toBe(FRAME_MS_SLOW);
    expect(frameInterval(0.5)).toBe(Math.round((FRAME_MS_FAST + FRAME_MS_SLOW) / 2));
  });

  it('opens with the fan still on frame 1', () => {
    vi.useFakeTimers();
    startLevel4();
    expect(screen.getByText(/room, it turns out, is not/i)).toBeTruthy();
    expect(roomFan().getAttribute('data-spinning')).toBe('false');
    expect(roomFrame()).toBe(1);
    act(() => vi.advanceTimersByTime(FRAME_MS_FAST * 10));
    expect(roomFrame()).toBe(1);
  });

  it('sweeps through every frame and back once switched on', () => {
    vi.useFakeTimers();
    startLevel4();
    clickThrough(() => Boolean(screen.queryByRole('button', { name: /switch it on/i })));
    switchOn();

    expect(roomFan().getAttribute('data-spinning')).toBe('true');
    const seen = [roomFrame()];
    for (let i = 1; i < SWEEP.length; i += 1) {
      act(() => vi.advanceTimersByTime(FRAME_MS_FAST));
      seen.push(roomFrame());
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 4, 3, 2]);
    act(() => vi.advanceTimersByTime(FRAME_MS_FAST));
    expect(roomFrame()).toBe(1);
  });

  it('draws every frame at one scale, standing on the same spot', () => {
    startLevel4();
    const imgs = [...document.querySelectorAll('.fan-prop__frame')];
    expect(imgs.length).toBe(5);
    imgs.forEach((img, i) => {
      const { width, height, anchor: [ax, ay] } = FAN_FRAMES[i];
      expect(Number.parseFloat(img.style.width)).toBeCloseTo((width / 260) * 100);
      expect(img.style.transform).toBe(
        `translate(${(-ax / width) * 100}%, ${((height - ay) / height) * 100}%)`,
      );
    });
    expect(imgs.filter((img) => img.style.opacity === '1').length).toBe(1);
  });

  it('is the last level: the end beat offers a replay, no Level 5', () => {
    startLevel4();
    clickThrough(() => Boolean(screen.queryByRole('button', { name: /switch it on/i })));
    switchOn();
    clickThrough(() => Boolean(screen.queryByText(/End of Level 4/i)));
    expect(roomFan().getAttribute('data-spinning')).toBe('true');
    expect(screen.getByRole('button', { name: /play level 4 again/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /continue to/i })).toBeNull();
  });
});
