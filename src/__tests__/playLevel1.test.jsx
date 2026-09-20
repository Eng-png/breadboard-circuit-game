import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { startGame } from './helpers/startGame.jsx';
import { resetIds } from '../shared/ids.js';
import {
  dragLeg,
  dragOver,
  drop,
  dropFromTray,
  holesOf,
  lastPlaced,
  place,
  tap,
} from './boardActions.js';

/**
 * Plays level 1 the way a person would: read the story, drag the parts into
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
    startGame();
    expect(screen.getByText(/Home\. It took longer/i)).toBeTruthy();
    expect(document.querySelector('[data-hole]')).toBeNull();
  });

  it('reaches the breadboard after the intro', () => {
    resetIds();
    startGame();
    readThroughIntro();
    expect(document.querySelector('[data-hole="A1"]')).toBeTruthy();
    expect(document.querySelector('[data-part="battery"]')).toBeTruthy();
  });

  it('the room stays dark until the circuit works', () => {
    resetIds();
    startGame();
    readThroughIntro();
    const veil = document.querySelector('.scene__veil');
    // opacity = 1 - light, so a dark room is close to 1.
    expect(Number(veil.style.opacity)).toBeGreaterThan(0.8);
  });

  it('coaches the player instead of just failing', () => {
    resetIds();
    startGame();
    readThroughIntro();
    place('led', 'A5', 'C5'); // both legs in one strip
    expect(screen.getByText(/same strip/i)).toBeTruthy();
  });

  it('a built circuit with the switch open explains that the switch is open', () => {
    resetIds();
    startGame();
    readThroughIntro();
    buildWorkingCircuit();
    expect(screen.getByText(/the switch is open/i)).toBeTruthy();
  });

  it('closing the switch lights the room and lets the story continue', () => {
    resetIds();
    startGame();
    readThroughIntro();
    buildWorkingCircuit();

    tap(document.querySelector('[data-placement^="switch-"]'));

    // The room is now lit by the player's own circuit.
    const veil = document.querySelector('.scene__veil');
    expect(Number(veil.style.opacity)).toBe(0);

    // And the story unblocks.
    expect(screen.getByRole('button', { name: /stand up and look around/i })).toBeTruthy();
  });

  it('flipping the switch back off makes the room dark again', () => {
    resetIds();
    startGame();
    readThroughIntro();
    buildWorkingCircuit();

    const switchPart = () => document.querySelector('[data-placement^="switch-"]');
    tap(switchPart());
    expect(Number(document.querySelector('.scene__veil').style.opacity)).toBe(0);

    tap(switchPart());
    expect(Number(document.querySelector('.scene__veil').style.opacity)).toBeGreaterThan(0.8);
  });

  it('reaches the end of level 1 — and stops there', () => {
    resetIds();
    startGame();
    readThroughIntro();
    buildWorkingCircuit();
    tap(document.querySelector('[data-placement^="switch-"]'));

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

describe('Dragging parts around', () => {
  const start = () => {
    resetIds();
    startGame();
    readThroughIntro();
  };

  it('a part dropped on the main grid lies along its row', () => {
    start();
    dropFromTray('resistor', 'B9');
    expect(holesOf(lastPlaced('resistor'))).toEqual(['B9', 'B12']);
  });

  it('a battery dropped on a rail goes across the rail pair', () => {
    start();
    dropFromTray('battery', 'TP1');
    expect(holesOf(lastPlaced('battery'))).toEqual(['TP1', 'TN1']);
  });

  it('anything else dropped on a rail reaches into the main grid', () => {
    start();
    dropFromTray('wire', 'TP5');
    expect(holesOf(lastPlaced('wire'))).toEqual(['TP5', 'A5']);
  });

  it('dragging one end moves only that leg', () => {
    start();
    dropFromTray('led', 'B13');
    dragLeg(lastPlaced('led'), 1, 'B17');
    expect(holesOf(lastPlaced('led'))).toEqual(['B13', 'B17']);
  });

  it('dragging the body moves the whole part, span intact', () => {
    start();
    dropFromTray('resistor', 'B9'); // B9–B12
    const part = lastPlaced('resistor');
    fireEvent.pointerDown(part, { clientX: 0, clientY: 0 });
    dragOver('D20');
    drop();
    expect(holesOf(lastPlaced('resistor'))).toEqual(['D20', 'D23']);
  });

  it('dragging a part off the board takes it away', () => {
    start();
    dropFromTray('led', 'B13');
    const part = lastPlaced('led');
    fireEvent.pointerDown(part, { clientX: 0, clientY: 0 });
    dragOver(null); // out over the room, not the board
    drop();
    expect(document.querySelector('[data-placement^="led-"]')).toBeNull();
  });

  it('tapping a part is not a drag — the switch flips and stays put', () => {
    start();
    dropFromTray('switch', 'A5');
    const before = holesOf(lastPlaced('switch'));

    tap(lastPlaced('switch'));
    expect(holesOf(lastPlaced('switch'))).toEqual(before);
    expect(lastPlaced('switch').querySelector('[data-closed="true"]')).toBeTruthy();

    tap(lastPlaced('switch'));
    expect(lastPlaced('switch').querySelector('[data-closed="false"]')).toBeTruthy();
  });

  it('undo puts a dragged part back where it was', () => {
    start();
    dropFromTray('resistor', 'B9');
    dragLeg(lastPlaced('resistor'), 1, 'B20');
    expect(holesOf(lastPlaced('resistor'))).toEqual(['B9', 'B20']);

    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(holesOf(lastPlaced('resistor'))).toEqual(['B9', 'B12']);
  });

  it('the keyboard can place and move a part without a pointer', () => {
    start();
    // detail: 0 is how the DOM says "this click came from the keyboard".
    fireEvent.click(document.querySelector('[data-part="led"]'), { detail: 0 });
    const holes = holesOf(lastPlaced('led'));
    expect(holes).toEqual(['A1', 'A4']);

    fireEvent.keyDown(lastPlaced('led'), { key: 'ArrowRight' });
    expect(holesOf(lastPlaced('led'))).toEqual(['A2', 'A5']);

    fireEvent.keyDown(lastPlaced('led'), { key: 'Delete' });
    expect(document.querySelector('[data-placement^="led-"]')).toBeNull();
  });
});

describe('The toolbox tray', () => {
  const start = () => {
    resetIds();
    startGame();
    readThroughIntro();
  };

  it('shows one picture slot per part, and no wall of text', () => {
    start();
    const slots = document.querySelectorAll('.tray__item');
    expect(slots.length).toBe(5);
    for (const slot of slots) {
      expect(slot.querySelector('.tray__art')).toBeTruthy();
      // A count, and whatever tiny lettering is drawn into the art itself —
      // but never the part's name or its blurb. Those live in the caption.
      expect(slot.textContent).not.toMatch(/battery|resistor|jumper|dimmer/i);
      expect(slot.querySelector('.tray__count')).toBeTruthy();
    }
  });

  it('names the part and explains it when you point at it', () => {
    start();
    const battery = document.querySelector('[data-part="battery"]');
    expect(screen.queryByText(/Pushes electricity/i)).toBeNull();

    fireEvent.pointerEnter(battery);
    expect(screen.getByText(/9 V battery/)).toBeTruthy();
    expect(screen.getByText(/Pushes electricity/i)).toBeTruthy();

    fireEvent.pointerLeave(battery);
    expect(screen.queryByText(/Pushes electricity/i)).toBeNull();
  });

  it('keeps the part named for a screen reader even without a hover', () => {
    start();
    const label = document
      .querySelector('[data-part="resistor"]')
      .getAttribute('aria-label');
    expect(label).toMatch(/330 . resistor/);
    expect(label).toMatch(/1 left/);
  });

  it('a used-up part is disabled, and its count runs down', () => {
    start();
    const count = () => document.querySelector('[data-part="led"] .tray__count').textContent;
    expect(count()).toBe('1');

    dropFromTray('led', 'B13');
    expect(count()).toBe('0');
    expect(document.querySelector('[data-part="led"]').disabled).toBe(true);
    expect(document.querySelector('[data-part="wire"] .tray__count').textContent).toBe('∞');
  });
});
