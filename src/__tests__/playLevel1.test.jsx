import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App.jsx';
import { resetIds } from '../shared/ids.js';

/**
 * Plays level 1 the way a person would: read the story, click the parts into
 * the board, flip the switch, watch the room light up.
 *
 * This is the test that actually says "the game works". The engine tests prove
 * the physics; this proves a human can reach it.
 */

afterEach(cleanup);

/** Click the story forward until the breadboard shows up. */
function readThroughIntro() {
  for (let guard = 0; guard < 30; guard += 1) {
    if (document.querySelector('[data-hole]')) return;
    const advance = document.querySelector('.dialogue__advance');
    if (!advance) break;
    fireEvent.click(advance);
  }
  throw new Error('Never reached the puzzle');
}

const clickHole = (id) => {
  const node = document.querySelector(`[data-hole="${id}"]`);
  if (!node) throw new Error(`No hole ${id} on the board`);
  fireEvent.click(node);
};

/** Arm a tray part, then drop its two legs. */
function place(type, first, second) {
  const button = document.querySelector(`[data-part="${type}"]`);
  if (!button) throw new Error(`No ${type} in the tray`);
  fireEvent.click(button);
  clickHole(first);
  clickHole(second);
}

function buildWorkingCircuit() {
  place('battery', 'TP1', 'TN1');
  place('wire', 'TP5', 'A5');
  place('switch', 'A5', 'A9');
  place('resistor', 'B9', 'B13');
  place('led', 'B13', 'B17');
  place('wire', 'A17', 'TN5');
}

describe('Level 1 — Lights Out', () => {
  it('opens on the story, not the puzzle', () => {
    resetIds();
    render(<App />);
    expect(screen.getByText(/Home\. It took longer/i)).toBeTruthy();
    expect(document.querySelector('[data-hole]')).toBeNull();
  });

  it('reaches the breadboard after the intro', () => {
    resetIds();
    render(<App />);
    readThroughIntro();
    expect(document.querySelector('[data-hole="A1"]')).toBeTruthy();
    expect(document.querySelector('[data-part="battery"]')).toBeTruthy();
  });

  it('the room stays dark until the circuit works', () => {
    resetIds();
    render(<App />);
    readThroughIntro();
    const veil = document.querySelector('.scene__veil');
    // opacity = 1 - light, so a dark room is close to 1.
    expect(Number(veil.style.opacity)).toBeGreaterThan(0.8);
  });

  it('coaches the player instead of just failing', () => {
    resetIds();
    render(<App />);
    readThroughIntro();
    place('led', 'A5', 'C5'); // both legs in one strip
    expect(screen.getByText(/same strip/i)).toBeTruthy();
  });

  it('a built circuit with the switch open explains that the switch is open', () => {
    resetIds();
    render(<App />);
    readThroughIntro();
    buildWorkingCircuit();
    expect(screen.getByText(/the switch is open/i)).toBeTruthy();
  });

  it('closing the switch lights the room and lets the story continue', () => {
    resetIds();
    render(<App />);
    readThroughIntro();
    buildWorkingCircuit();

    fireEvent.click(document.querySelector('[data-placement^="switch-"]'));

    // The room is now lit by the player's own circuit.
    const veil = document.querySelector('.scene__veil');
    expect(Number(veil.style.opacity)).toBe(0);

    // And the story unblocks.
    expect(screen.getByRole('button', { name: /stand up and look around/i })).toBeTruthy();
  });

  it('flipping the switch back off makes the room dark again', () => {
    resetIds();
    render(<App />);
    readThroughIntro();
    buildWorkingCircuit();

    const switchPart = () => document.querySelector('[data-placement^="switch-"]');
    fireEvent.click(switchPart());
    expect(Number(document.querySelector('.scene__veil').style.opacity)).toBe(0);

    fireEvent.click(switchPart());
    expect(Number(document.querySelector('.scene__veil').style.opacity)).toBeGreaterThan(0.8);
  });

  it('reaches the end of level 1 — and stops there', () => {
    resetIds();
    render(<App />);
    readThroughIntro();
    buildWorkingCircuit();
    fireEvent.click(document.querySelector('[data-placement^="switch-"]'));

    fireEvent.click(screen.getByRole('button', { name: /stand up and look around/i }));

    // The payoff beat, then the hook into level 2.
    for (let guard = 0; guard < 10; guard += 1) {
      const advance = document.querySelector('.dialogue__advance');
      if (!advance) break;
      fireEvent.click(advance);
    }

    expect(screen.getByText(/End of Level 1/i)).toBeTruthy();
    expect(screen.getByText(/too much/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /play level 1 again/i })).toBeTruthy();
  });
});
