/**
 * OWNER: Person D (Content) / Person C (format)
 *
 * LEVEL 3 — "Reading Light"
 *
 * The level 2 circuit is back on the board, working and safe — but fixed at
 * one brightness. Between the LED and the return wire there is a gap, and the
 * tray holds a potentiometer. Settle on a soft reading light and the level is
 * done.
 *
 * Board layout:
 *   TP1/TN1   battery          A5-A9    switch (closed)
 *   TP5-A5    feed wire        B9-B13   330 Ω resistor
 *   B13-B17   LED              [gap: column 17 -> column 21]
 *   A21-TN5   return wire
 *
 * THE THREE PINS. The dimmer drops in across the gap with a pin in column 17,
 * its wiper in 19 and a pin in 21 — voltage in from the LED on one side,
 * ground on the other, the wiper sitting between them:
 *
 *   col 17 ──/\/\/\── col 19 ──/\/\/\── col 21
 *   (from LED)         (wiper)          (to ground)
 *
 * Wired like that the current runs end to end past the wiper, so it crosses
 * the whole track whatever the knob says and nothing dims. The fix is the one
 * every bench uses: a jumper from the wiper to the ground end. That shorts the
 * lower half out and leaves the knob in charge of everything between the LED
 * and ground.
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
    'There is a gap after the LED and a dimmer in the tray. The dimmer has three ' +
    'pins: the outer two are the ends of a resistive track, and the middle one is ' +
    'the wiper the knob slides along it. Get the current going through that wiper, ' +
    'then turn it until the room is soft enough to sit in.',

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
      /*
       * The whole lesson. Both outer pins in the loop is a legal circuit and a
       * complete one — it is just the whole track, fixed, with the wiper doing
       * nothing. Only current that enters or leaves at the wiper answers to
       * the knob, so only that counts as having wired a dimmer.
       */
      id: 'wiper',
      description: 'Send the current through the wiper, not straight across the track',
      check: ({ resultClosed, placements }) => {
        const pot = potOf(placements);
        if (!pot) return false;
        return resultClosed.components[pot.id]?.viaWiper === true;
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
    'Drag the dimmer out of the tray onto column 17. Its three legs land in columns 17, 19 and 21: one end taking the current from the LED, the wiper in the middle, the other end on the wire back to the battery. It has no + or −.',
    'Turning the knob does nothing yet, and that is the point. The current is going in one end and out the other, so it crosses the whole track every time. The wiper in column 19 is not connected to anything.',
    'Run a jumper from the wiper’s column, 19, to column 21 — the ground end. Now the current leaves at the wiper instead of carrying on through the rest of the track, and the knob decides how much track it had to cross. That is how a dimmer is wired on a real bench.',
    'Once the wiper is carrying the current, press on the dimmer and drag down to dim, up to brighten. There is a slider under the board too. Watch the room, the LED, and the ohms reading change together.',
    'The 330 Ω resistor is still in the loop, so even fully down the dimmer cannot hurt the LED. In real dimmers that fixed resistor is there for exactly that reason.',
  ],

  realWorld: {
    title: 'That knob is a potentiometer',
    body:
      'A potentiometer is a resistor with a moving contact: turn the shaft and the ' +
      'current has to cross more or less of the resistive track. That is why it has ' +
      'three pins — one at each end of the track, and one on the contact itself. ' +
      'Wire the two ends across a supply and the wiper reads off a fraction of the ' +
      'voltage, which is how a volume knob or a joystick axis talks to a chip. Wire ' +
      'one end and the wiper into a circuit, as you just did, and it is a variable ' +
      'resistor instead. Same part, two jobs, decided entirely by which pins you use.',
  },
};
