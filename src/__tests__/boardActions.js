/**
 * The gestures a player makes, as functions. Shared by every playthrough test
 * so there is exactly one place that knows how placing a part works — when the
 * interaction changes again, only this file does.
 *
 * Not a .test.js file, so vitest does not try to collect it.
 */

import { fireEvent, screen } from '@testing-library/react';

const holeNode = (id) => {
  const node = document.querySelector(`[data-hole="${id}"]`);
  if (!node) throw new Error(`No hole ${id} on the board`);
  return node;
};

/**
 * Move the pointer far enough that a press counts as a drag, then over a hole.
 * Passing null sweeps it off the board entirely.
 */
export function dragOver(id) {
  fireEvent.pointerMove(window, { clientX: 200, clientY: 200 });
  if (id) fireEvent.pointerOver(holeNode(id));
  else fireEvent.pointerOut(document.querySelector('.breadboard'), { relatedTarget: document.body });
}

/** Let go wherever the pointer currently is. */
export const drop = () => fireEvent.pointerUp(window);

/** Drag a part out of the tray and drop it with one leg on `anchor`. */
export function dropFromTray(type, anchor) {
  const button = document.querySelector(`[data-part="${type}"]`);
  if (!button) throw new Error(`No ${type} in the tray`);
  fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
  dragOver(anchor);
  drop();
}

/**
 * The most recently placed part of this type, on the board. Scoped to the
 * board because a potentiometer's knob carries the same data-placement.
 */
export function lastPlaced(type) {
  const nodes = document.querySelectorAll(`.breadboard [data-placement^="${type}-"]`);
  if (nodes.length === 0) throw new Error(`No ${type} on the board`);
  return nodes[nodes.length - 1];
}

export const holesOf = (node) => node.getAttribute('data-holes').split(',');

/** Drag one end of a placed part into another hole. */
export function dragLeg(part, legIndex, target) {
  const handle = part.querySelector(`[data-leg="${legIndex}"]`);
  if (!handle) throw new Error(`No leg ${legIndex} handle`);
  fireEvent.pointerDown(handle, { clientX: 0, clientY: 0 });
  dragOver(target);
  drop();
}

/** Drop a part, then pull its far leg to where we actually want it. */
export function place(type, first, second) {
  dropFromTray(type, first);
  const part = lastPlaced(type);
  if (holesOf(part)[1] === second) return;
  dragLeg(part, 1, second);
}

/** Press and release without moving — a tap, not a drag. Flips a switch. */
export function tap(node) {
  fireEvent.pointerDown(node, { clientX: 0, clientY: 0 });
  drop();
}

/**
 * Take a part off the board by dragging it away. Uses leg 0, because the one
 * part whose body is not grabbable — the potentiometer, whose body is its
 * knob — still has to be removable.
 */
export function pullOff(part) {
  const handle = part.querySelector('[data-leg="0"]') ?? part;
  fireEvent.pointerDown(handle, { clientX: 0, clientY: 0 });
  dragOver(null);
  drop();
}

/** Click every advance button until one stops appearing (or the board shows). */
export function clickThrough(stopWhen) {
  for (let guard = 0; guard < 30; guard += 1) {
    if (stopWhen()) return;
    const advance = document.querySelector('.dialogue__advance');
    if (!advance) break;
    fireEvent.click(advance);
  }
  if (!stopWhen()) throw new Error('Story did not reach the expected point');
}

export const boardVisible = () => Boolean(document.querySelector('[data-hole]'));

/** Build level 1's working circuit and walk the story to its end beat. */
export function finishLevel1() {
  clickThrough(boardVisible);
  place('battery', 'TP1', 'TN1');
  place('wire', 'TP5', 'A5');
  place('switch', 'A5', 'A9');
  place('resistor', 'B9', 'B13');
  place('led', 'B13', 'B17');
  place('wire', 'A17', 'TN5');
  tap(document.querySelector('[data-placement^="switch-"]'));
  fireEvent.click(screen.getByRole('button', { name: /stand up and look around/i }));
  clickThrough(() => Boolean(screen.queryByText(/End of Level 1/i)));
}
