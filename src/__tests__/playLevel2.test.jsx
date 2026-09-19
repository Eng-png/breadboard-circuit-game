import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App.jsx';
import { resetIds } from '../shared/ids.js';

/**
 * Plays level 2 the way a person would: finish level 1, step into level 2,
 * pull the jumper that is over-driving the LED, and drop a resistor in its
 * place.
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

/** Click every advance button until one stops appearing (or the board shows). */
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

/** Play level 1 to its end beat. */
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

function startLevel2() {
  resetIds();
  render(<App />);
  finishLevel1();
  fireEvent.click(screen.getByRole('button', { name: /continue to level 2/i }));
}

const veilOpacity = () => Number(document.querySelector('.scene__veil').style.opacity);
const glareOpacity = () => Number(document.querySelector('.scene__glare').style.opacity);

describe('Level 2 — Turn It Down', () => {
  it('level 1 ends with a way into level 2', () => {
    resetIds();
    render(<App />);
    finishLevel1();
    expect(screen.getByRole('button', { name: /continue to level 2/i })).toBeTruthy();
  });

  it('opens on a glaring room, not the puzzle', () => {
    startLevel2();
    expect(screen.getByText(/shade your eyes/i)).toBeTruthy();
    expect(document.querySelector('[data-hole]')).toBeNull();
    expect(glareOpacity()).toBe(1);
  });

  it('starts the puzzle with the circuit already built and over-driving the LED', () => {
    startLevel2();
    clickThrough(boardVisible);

    expect(document.querySelector('[data-placement="pre-led"]')).toBeTruthy();
    expect(document.querySelector('[data-placement="pre-bridge"]')).toBeTruthy();
    expect(screen.getByText(/too much current/i)).toBeTruthy();

    // Lit, but painfully so.
    expect(veilOpacity()).toBe(0);
    expect(glareOpacity()).toBe(1);
  });

  it('only hands the player a resistor to add', () => {
    startLevel2();
    clickThrough(boardVisible);
    expect(document.querySelector('[data-part="resistor"]').disabled).toBe(false);
    expect(document.querySelector('[data-part="led"]').disabled).toBe(true);
    expect(document.querySelector('[data-part="battery"]').disabled).toBe(true);
  });

  it('pulling the jumper breaks the loop and kills the glare', () => {
    startLevel2();
    clickThrough(boardVisible);

    fireEvent.click(document.querySelector('[data-placement="pre-bridge"]'));

    expect(document.querySelector('[data-placement="pre-bridge"]')).toBeNull();
    expect(screen.getByText(/gap in your loop/i)).toBeTruthy();
    expect(glareOpacity()).toBe(0);
    expect(veilOpacity()).toBeGreaterThan(0.8);
  });

  it('a resistor in the jumper’s place dims the light and lets the story continue', () => {
    startLevel2();
    clickThrough(boardVisible);

    fireEvent.click(document.querySelector('[data-placement="pre-bridge"]'));
    place('resistor', 'B9', 'B13');

    expect(veilOpacity()).toBe(0);
    expect(glareOpacity()).toBe(0);
    expect(screen.getByText(/flowing all the way round/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /lower your hand/i })).toBeTruthy();
  });

  it('a resistor somewhere off the loop does not count', () => {
    startLevel2();
    clickThrough(boardVisible);

    place('resistor', 'A25', 'A29');

    expect(glareOpacity()).toBe(1);
    expect(screen.queryByRole('button', { name: /lower your hand/i })).toBeNull();
  });

  it('reaches the end of the game', () => {
    startLevel2();
    clickThrough(boardVisible);
    fireEvent.click(document.querySelector('[data-placement="pre-bridge"]'));
    place('resistor', 'B9', 'B13');
    fireEvent.click(screen.getByRole('button', { name: /lower your hand/i }));
    clickThrough(() => Boolean(screen.queryByText(/End of Level 2/i)));

    expect(screen.getByText(/every level there is/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /continue to/i })).toBeNull();
    expect(screen.getByRole('button', { name: /play level 2 again/i })).toBeTruthy();
  });
});
