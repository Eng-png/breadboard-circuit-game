import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App.jsx';
import { resetIds } from '../shared/ids.js';

/**
 * Plays level 3 the way a person would: finish levels 1 and 2, bridge the gap
 * after the LED with the dimmer, and turn the knob until the light is soft.
 */

afterEach(cleanup);

const clickHole = (id) => {
  const node = document.querySelector(`[data-hole="${id}"]`);
  if (!node) throw new Error(`No hole ${id} on the board`);
  fireEvent.click(node);
};

function place(type, first, second) {
  const button = document.querySelector(`[data-part="${type}"]`);
  if (!button) throw new Error(`No ${type} in the tray`);
  fireEvent.click(button);
  clickHole(first);
  clickHole(second);
}

function clickThrough(stopWhen) {
  for (let guard = 0; guard < 30; guard += 1) {
    if (stopWhen()) return;
    const advance = document.querySelector('.dialogue__advance');
    if (!advance) break;
    fireEvent.click(advance);
  }
  if (!stopWhen()) throw new Error('Story did not reach the expected point');
}

const boardVisible = () => Boolean(document.querySelector('[data-hole]'));

function finishLevel1() {
  clickThrough(boardVisible);
  place('battery', 'TP1', 'TN1');
  place('wire', 'TP5', 'A5');
  place('switch', 'A5', 'A9');
  place('resistor', 'B9', 'B13');
  place('led', 'B13', 'B17');
  place('wire', 'A17', 'TN5');
  fireEvent.click(document.querySelector('[data-placement^="switch-"]'));
  fireEvent.click(screen.getByRole('button', { name: /stand up and look around/i }));
  clickThrough(() => Boolean(screen.queryByText(/End of Level 1/i)));
}

function finishLevel2() {
  fireEvent.click(screen.getByRole('button', { name: /continue to level 2/i }));
  clickThrough(boardVisible);
  fireEvent.click(document.querySelector('[data-placement="pre-bridge"]'));
  place('resistor', 'B9', 'B13');
  fireEvent.click(screen.getByRole('button', { name: /lower your hand/i }));
  clickThrough(() => Boolean(screen.queryByText(/End of Level 2/i)));
}

function startLevel3() {
  resetIds();
  render(<App />);
  finishLevel1();
  finishLevel2();
  fireEvent.click(screen.getByRole('button', { name: /continue to level 3/i }));
}

const veilOpacity = () => Number(document.querySelector('.scene__veil').style.opacity);
const knob = () => document.querySelector('.knob__input');
const turnTo = (percent) => fireEvent.change(knob(), { target: { value: String(percent) } });
const continueButton = () => screen.queryByRole('button', { name: /sit back down/i });

describe('Level 3 — Reading Light', () => {
  it('opens on the story, then a board with a gap after the LED', () => {
    startLevel3();
    expect(screen.getByText(/found a book/i)).toBeTruthy();
    clickThrough(boardVisible);

    expect(document.querySelector('[data-placement="pre-led"]')).toBeTruthy();
    expect(document.querySelector('[data-placement="pre-resistor"]')).toBeTruthy();
    expect(screen.getByText(/gap in your loop/i)).toBeTruthy();
    expect(knob()).toBeNull();
    expect(document.querySelector('[data-part="potentiometer"]').disabled).toBe(false);
  });

  it('bridging the gap with the dimmer lights the room at full and shows a knob', () => {
    startLevel3();
    clickThrough(boardVisible);

    place('potentiometer', 'C17', 'C21');

    expect(knob()).toBeTruthy();
    expect(knob().value).toBe('0');
    expect(screen.getByText(/^0 Ω$/)).toBeTruthy();
    expect(veilOpacity()).toBe(0);
    expect(screen.getByText(/flowing all the way round/i)).toBeTruthy();
    // Full brightness is not a reading light yet.
    expect(continueButton()).toBeNull();
  });

  it('more resistance means a dimmer room; less means brighter', () => {
    startLevel3();
    clickThrough(boardVisible);
    place('potentiometer', 'C17', 'C21');

    turnTo(100);
    const dim = veilOpacity();
    expect(screen.getByText(/^1000 Ω$/)).toBeTruthy();
    expect(dim).toBeGreaterThan(0.5);
    expect(dim).toBeLessThan(0.93); // still on — not as dark as an open switch

    turnTo(50);
    const half = veilOpacity();
    expect(half).toBeLessThan(dim);
    expect(half).toBeGreaterThan(0);

    turnTo(0);
    expect(veilOpacity()).toBe(0);
  });

  it('the knob turns the pointer on the part itself', () => {
    startLevel3();
    clickThrough(boardVisible);
    place('potentiometer', 'C17', 'C21');

    expect(document.querySelector('.part__pot').dataset.turn).toBe('0.00');
    turnTo(75);
    expect(document.querySelector('.part__pot').dataset.turn).toBe('0.75');
  });

  it('a soft setting completes the level; a spotlight does not', () => {
    startLevel3();
    clickThrough(boardVisible);
    place('potentiometer', 'C17', 'C21');

    turnTo(50);
    expect(continueButton()).toBeTruthy();

    turnTo(0);
    expect(continueButton()).toBeNull();

    turnTo(50);
    fireEvent.click(document.querySelector('[data-placement="pre-switch"]'));
    expect(veilOpacity()).toBeGreaterThan(0.9);
    expect(continueButton()).toBeNull();
  });

  it('the dimmer somewhere off the loop does nothing', () => {
    startLevel3();
    clickThrough(boardVisible);

    place('potentiometer', 'A25', 'A29');

    expect(knob()).toBeTruthy();
    expect(screen.getByText(/gap in your loop/i)).toBeTruthy();
    turnTo(50);
    expect(continueButton()).toBeNull();
  });

  it('reaches the end of the game', () => {
    startLevel3();
    clickThrough(boardVisible);
    place('potentiometer', 'C17', 'C21');
    turnTo(50);
    fireEvent.click(continueButton());
    clickThrough(() => Boolean(screen.queryByText(/End of Level 3/i)));

    expect(screen.getByText(/every level there is/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /continue to/i })).toBeNull();
    expect(screen.getByRole('button', { name: /play level 3 again/i })).toBeTruthy();
  });
});
