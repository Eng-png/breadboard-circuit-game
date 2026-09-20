import { describe, expect, it, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { startGame } from './helpers/startGame.jsx';
import { resetIds } from '../shared/ids.js';
import { boardVisible, clickThrough, place, tap } from './boardActions.js';
import { FAN_FRAMES } from '../content/assets.js';
import { FRAME_MS_FAST, LAST, START, stepSweep } from '../story/fanSweep.js';
import { sideAt } from '../story/useLimitSwitches.js';

/**
 * Plays level 4 the way a person would: wire battery → switch → fan into the
 * gap, watch the fan run into the end of its travel and stall, then hang a
 * limit switch at each end so the Arduino turns it round.
 *
 * jsdom has no layout, so the fan's box and the scene's box are stubbed: the
 * scene is 1000×800 and the fan stands at x 700..900, y 400..800.
 */

// Only the fan frames "exist" on disk; everything else falls back to SVG.
vi.mock('../breadboard/useImageAvailable.js', () => ({
  useImageAvailable: (src) => src.includes('/props/fan/'),
}));

const SCENE = { left: 0, top: 0, right: 1000, bottom: 800, width: 1000, height: 800 };
const FAN = { left: 700, top: 400, right: 900, bottom: 800, width: 200, height: 400 };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function startLevel4() {
  resetIds();
  startGame();
  fireEvent.click(screen.getByRole('button', { name: /level 4/i }));
}

function layOut() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
    if (this.classList.contains('scene')) return SCENE;
    if (this.classList.contains('fan-prop')) return FAN;
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  });
}

const roomFan = () => document.querySelector('.fan-prop');
const roomFrame = () => Number(roomFan().getAttribute('data-frame'));
const spinning = () => roomFan().getAttribute('data-spinning') === 'true';
const stalled = () => roomFan().getAttribute('data-stalled') === 'true';
const limitSwitches = () => screen.getAllByRole('button', { name: /^limit switch \d/i });
const arduino = () => screen.getByRole('img', { name: /^arduino/i });
const continueButton = () => screen.queryByRole('button', { name: /sit back down/i });
const tick = (n = 1) => act(() => vi.advanceTimersByTime(FRAME_MS_FAST * n));

/** Drag a limit switch by the pointer and let go at a client point. */
function dragSwitchTo(sw, x, y) {
  fireEvent.pointerDown(sw, { clientX: 0, clientY: 0 });
  fireEvent.pointerMove(window, { clientX: x, clientY: y });
  fireEvent.pointerUp(window, { clientX: x, clientY: y });
}

function wireTheFan() {
  clickThrough(boardVisible);
  place('switch', 'A5', 'A9');
  place('fan', 'B9', 'B17');
  tap(document.querySelector('[data-placement^="switch-"]'));
}

describe('Level 4 — Fresh Air (limit switches)', () => {
  it('sweep logic: a bare motor stalls at an end; a limit switch turns it round', () => {
    const none = { left: false, right: false };
    let s = START;
    for (let i = 0; i < LAST; i += 1) s = stepSweep(s, none).state;
    expect(s).toEqual({ frame: LAST, dir: 1, stalled: false });

    const stuck = stepSweep(s, none);
    expect(stuck.hit).toBeNull();
    expect(stuck.state.stalled).toBe(true);
    expect(stuck.state.frame).toBe(LAST);

    const turned = stepSweep(stuck.state, { left: true, right: false });
    expect(turned.hit).toBe('left');
    expect(turned.state).toEqual({ frame: LAST - 1, dir: -1, stalled: false });

    let back = turned.state;
    for (let i = 0; i < LAST - 1; i += 1) back = stepSweep(back, none).state;
    expect(back.frame).toBe(0);
    expect(stepSweep(back, { left: true, right: false }).state.stalled).toBe(true);
    expect(stepSweep(back, { left: true, right: true }).hit).toBe('right');
  });

  it('drop zones: beside either end of the fan, nowhere else', () => {
    expect(sideAt({ x: 680, y: 500 }, FAN)).toBe('left');
    expect(sideAt({ x: 920, y: 500 }, FAN)).toBe('right');
    expect(sideAt({ x: 800, y: 500 }, FAN)).toBeNull(); // the middle of the head
    expect(sideAt({ x: 680, y: 750 }, FAN)).toBeNull(); // down by the stand
    expect(sideAt({ x: 300, y: 500 }, FAN)).toBeNull(); // across the room
    expect(sideAt({ x: 680, y: 500 }, { ...FAN, width: 0 })).toBeNull();
  });

  it('opens on the story with a still fan, then a board with the fan in the tray and an Arduino above it', () => {
    startLevel4();
    expect(screen.getByText(/room, it turns out, is not/i)).toBeTruthy();
    expect(spinning()).toBe(false);
    expect(roomFrame()).toBe(1);
    expect(screen.queryByRole('img', { name: /^arduino/i })).toBeNull();

    clickThrough(boardVisible);
    expect(document.querySelector('[data-part="fan"]').disabled).toBe(false);
    expect(document.querySelector('[data-part="resistor"]')).toBeNull();
    expect(document.querySelector('[data-part="limit-switch"]')).toBeNull();

    const dock = arduino();
    expect(dock.getAttribute('aria-label')).toMatch(/left limit switch not connected/i);
    // Docked above the breadboard, not beside it or inside it.
    const board = document.querySelector('.puzzle__board');
    expect(board.contains(dock)).toBe(true);
    expect(board.querySelector('.puzzle__dock').nextElementSibling.classList.contains('breadboard-wrap')).toBe(true);
    expect(document.querySelector('.breadboard').contains(dock)).toBe(false);
  });

  it('two limit switches with wires sit loose in the room and never snap to a hole', () => {
    layOut();
    startLevel4();
    clickThrough(boardVisible);

    const [a, b] = limitSwitches();
    expect(limitSwitches().length).toBe(2);
    expect(a.querySelectorAll('.limit-switch__wire').length).toBeGreaterThanOrEqual(2);
    expect(a.getAttribute('data-side')).toBe('none');
    expect(document.querySelector('.breadboard').contains(a)).toBe(false);

    // Drop it right on a breadboard hole: it lands where the pointer let go,
    // gains no data-holes, and the board gains nothing.
    const before = document.querySelectorAll('.breadboard [data-placement]').length;
    dragSwitchTo(a, 250, 300);
    expect(a.style.left).toBe('25%');
    expect(a.style.top).toBe('37.5%');
    expect(a.hasAttribute('data-holes')).toBe(false);
    expect(document.querySelectorAll('.breadboard [data-placement]').length).toBe(before);
    expect(a.getAttribute('data-side')).toBe('none');
    expect(b.style.left).toBe('72%');
  });

  it('battery → switch → fan runs the fan; it stalls at the end with no switch there', () => {
    vi.useFakeTimers();
    layOut();
    startLevel4();
    wireTheFan();

    expect(spinning()).toBe(true);
    expect(continueButton()).toBeNull();

    tick(LAST);
    expect(roomFrame()).toBe(LAST + 1);
    tick();
    expect(roomFrame()).toBe(LAST + 1);
    expect(stalled()).toBe(true);
    expect(spinning()).toBe(false);

    // Off at the switch: the fan stops dead.
    tap(document.querySelector('[data-placement^="switch-"]'));
    expect(stalled()).toBe(false);
    expect(spinning()).toBe(false);
  });

  it('a limit switch at the stalled end gets pressed and the fan turns round; the other end still stalls', () => {
    vi.useFakeTimers();
    layOut();
    startLevel4();
    wireTheFan();
    tick(LAST + 1);
    expect(stalled()).toBe(true);

    const [a] = limitSwitches();
    dragSwitchTo(a, 680, 500);
    expect(a.getAttribute('data-side')).toBe('left');
    expect(arduino().getAttribute('aria-label')).toMatch(/left limit switch connected/i);
    expect(spinning()).toBe(true);

    tick();
    expect(roomFrame()).toBe(LAST);
    expect(a.getAttribute('data-pressed')).toBe('true');
    expect(arduino().getAttribute('data-hit')).toBe('left');

    tick(LAST);
    expect(roomFrame()).toBe(1);
    expect(stalled()).toBe(true);
    expect(continueButton()).toBeNull();
  });

  it('both switches placed: the fan sweeps back and forth and the level can be finished', () => {
    vi.useFakeTimers();
    layOut();
    startLevel4();
    wireTheFan();

    const [a, b] = limitSwitches();
    dragSwitchTo(a, 680, 500);
    dragSwitchTo(b, 920, 500);
    expect(arduino().getAttribute('aria-label')).toMatch(/left limit switch connected, right limit switch connected/i);
    expect(continueButton()).toBeTruthy();

    const seen = [roomFrame()];
    for (let i = 0; i < 2 * LAST + 2; i += 1) {
      tick();
      seen.push(roomFrame());
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3]);
    expect(stalled()).toBe(false);

    // Taking a switch away takes the finish away with it.
    dragSwitchTo(b, 300, 700);
    expect(continueButton()).toBeNull();
    dragSwitchTo(b, 920, 500);

    fireEvent.click(continueButton());
    clickThrough(() => Boolean(screen.queryByText(/End of Level 4/i)));
    expect(spinning()).toBe(true);
    expect(screen.getByRole('button', { name: /play level 4 again/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /continue to/i })).toBeNull();
  });

  it('keyboard: Enter walks a switch floor → left → right → floor', () => {
    layOut();
    startLevel4();
    clickThrough(boardVisible);
    const [a] = limitSwitches();
    fireEvent.keyDown(a, { key: 'Enter' });
    expect(a.getAttribute('data-side')).toBe('left');
    fireEvent.keyDown(a, { key: ' ' });
    expect(a.getAttribute('data-side')).toBe('right');
    fireEvent.keyDown(a, { key: 'Enter' });
    expect(a.getAttribute('data-side')).toBe('none');
    fireEvent.keyDown(a, { key: 'Enter' });
    fireEvent.keyDown(a, { key: 'Delete' });
    expect(a.getAttribute('data-side')).toBe('none');
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
});
