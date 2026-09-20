/**
 * OWNER: Person D (Content) / Person C (format)
 *
 * LEVEL 3 — "Reading Light"
 *
 * The level 2 circuit is back on the board, working and safe — but fixed at
 * one brightness. Between the LED and the return wire there is a gap, and the
 * tray holds a potentiometer. Bridge the gap with it and a knob appears under
 * the board: more resistance, less current, dimmer light. Settle on a soft
 * reading light and the level is done.
 *
 * Board layout:
 *   TP1/TN1   battery          A5-A9    switch (closed)
 *   TP5-A5    feed wire        B9-B13   330 Ω resistor
 *   B13-B17   LED              [gap: column 17 -> column 21]
 *   A21-TN5   return wire
 *
 * With the 330 Ω resistor still in the loop the dimmer can never burn the LED
 * out, which is exactly how you would wire one for real.
 */

/** Brightness band that counts as "a reading light" — dimmed, but clearly on. */
export const SOFT_MIN = 0.2;
export const SOFT_MAX = 0.6;

const ledOf = (placements) => placements.find((p) => p.type === 'led');
const potOf = (placements) => placements.find((p) => p.type === 'potentiometer');

/** @type {import('../../shared/types.js').Level} */
export const level3 = {
  id: 'level-3',
  title: 'Reading Light',
  brief:
    'The light is fine now — for cooking. For reading it is still a spotlight. ' +
    'There is a gap after the LED and a dimmer in the tray. Put the dimmer in the ' +
    'gap, then turn it until the room is soft enough to sit in.',

  tray: [
    { type: 'wire', count: Infinity },
    { type: 'battery', count: 1 },
    { type: 'switch', count: 1 },
    { type: 'led', count: 1 },
    { type: 'resistor', count: 1 },
    { type: 'potentiometer', count: 1 },
  ],

  preplaced: [
    { id: 'pre-battery', type: 'battery', holes: ['TP1', 'TN1'], state: {} },
    { id: 'pre-feed', type: 'wire', holes: ['TP5', 'A5'], state: {} },
    { id: 'pre-switch', type: 'switch', holes: ['A5', 'A9'], state: { closed: true } },
    { id: 'pre-resistor', type: 'resistor', holes: ['B9', 'B13'], state: {} },
    { id: 'pre-led', type: 'led', holes: ['B13', 'B17'], state: {} },
    { id: 'pre-return', type: 'wire', holes: ['A21', 'TN5'], state: {} },
  ],

  objectives: [
    {
      id: 'loop',
      description: 'Close the loop from + back to −',
      check: ({ resultClosed }) => resultClosed.complete && !resultClosed.shorted,
    },
    {
      id: 'pot-in-loop',
      description: 'Put the dimmer in the path of the current',
      check: ({ resultClosed, placements }) => {
        const pot = potOf(placements);
        if (!pot) return false;
        return resultClosed.components[pot.id]?.energized === true;
      },
    },
    {
      id: 'soft',
      description: 'Turn the knob until the light is soft — between 20% and 60%',
      check: ({ result, placements }) => {
        const led = ledOf(placements);
        if (!led) return false;
        const state = result.components[led.id];
        if (state?.lit !== true) return false;
        const brightness = state.brightness ?? 1;
        return brightness >= SOFT_MIN && brightness <= SOFT_MAX;
      },
    },
    {
      id: 'switch-off',
      description: 'With the switch OPEN, the LED is dark',
      check: ({ resultOpen, placements }) => {
        const led = ledOf(placements);
        if (!led) return false;
        return resultOpen.components[led.id]?.lit !== true;
      },
    },
  ],

  hints: [
    'Follow the loop from the LED’s short leg. It reaches column 17 and stops — the return wire starts four columns later, at 21. That gap is where the dimmer goes.',
    'Click the dimmer in the tray, then one hole in column 17 and one in column 21 (rows A to E share a strip, so any row works). It has no + or −.',
    'Once the dimmer is on the board, press on it and drag down to dim, up to brighten. There is a slider under the board too. Watch the room, the LED, and the ohms reading change together.',
    'The 330 Ω resistor is still in the loop, so even fully down the dimmer cannot hurt the LED. In real dimmers that fixed resistor is there for exactly that reason.',
  ],

  realWorld: {
    title: 'That knob is a potentiometer',
    body:
      'A potentiometer is a resistor with a moving contact: turn the shaft and the ' +
      'current has to cross more or less of the resistive track. Volume knobs, ' +
      'dimmer switches, joystick axes and the brightness wheel on a torch are all ' +
      'the same part. Modern LED dimmers usually pulse the light on and off very fast ' +
      'instead — but the knob you turn is still, very often, a potentiometer.',
  },
};
