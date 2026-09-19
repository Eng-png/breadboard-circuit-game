/**
 * OWNER: Person D (wording, hints, real-world note)
 *          + Person C (objective `check` functions)
 *
 * LEVEL 1 — "Light It Up"
 * The player wires a battery, switch, resistor and LED into one loop, then
 * flips the switch to prove the light is under their control.
 *
 * The win condition is deliberately two-sided: the LED must be OFF with the
 * switch open and ON with it closed. That rules out the common cheat of
 * bridging around the switch, and it is the actual idea the level teaches.
 */

/** @typedef {import('../../shared/types.js').Level} Level */

/** @type {Level} */
export const level1 = {
  id: 'level-1',
  title: 'Light It Up',
  brief:
    'Electricity only does useful work when it can travel in a complete loop. ' +
    'Build a loop from the battery, through a switch and a resistor, to the LED ' +
    'and back — then put the light under your control.',

  tray: [
    { type: 'wire', count: Infinity },
    { type: 'battery', count: 1 },
    { type: 'switch', count: 1 },
    { type: 'resistor', count: 1 },
    { type: 'led', count: 1 },
  ],

  preplaced: [],

  objectives: [
    {
      id: 'loop',
      description: 'Build one complete loop from + back to −',
      check: ({ resultClosed }) => resultClosed.complete && !resultClosed.shorted,
    },
    {
      id: 'protected',
      description: 'Protect the LED with the resistor',
      check: ({ resultClosed, placements }) => {
        const led = placements.find((p) => p.type === 'led');
        if (!led) return false;
        return resultClosed.components[led.id]?.burnedOut === false;
      },
    },
    {
      id: 'switch-off',
      description: 'With the switch OPEN, the LED is dark',
      check: ({ resultOpen, placements }) => {
        const led = placements.find((p) => p.type === 'led');
        if (!led) return false;
        return resultOpen.components[led.id]?.lit !== true;
      },
    },
    {
      id: 'switch-on',
      description: 'With the switch CLOSED, the LED lights up',
      check: ({ resultClosed, placements }) => {
        const led = placements.find((p) => p.type === 'led');
        if (!led) return false;
        return resultClosed.components[led.id]?.lit === true;
      },
    },
  ],

  hints: [
    'Holes in the same column strip (A1–E1) are already joined inside the board. You do not need a wire between them.',
    'The gap down the middle splits every column in two. A1–E1 and F1–J1 are NOT connected.',
    'Give each component its own column. If both legs of the LED land in the same strip, current skips straight past it.',
    'The LED only works one way round. Its long leg (anode) must face the battery’s + side.',
    'Put the switch anywhere along the loop — a break anywhere stops the whole thing. That is why one light switch controls one light.',
  ],

  realWorld: {
    title: 'You just built a light switch',
    body:
      'The switch on your wall does exactly this: it opens and closes a gap in a loop ' +
      'running from the power source to the bulb and back. Nothing clever happens inside ' +
      'the switch — it is two pieces of metal that touch or do not. The same loop shows up ' +
      'in a torch, a car headlight, and the button on a game controller.',
  },
};
