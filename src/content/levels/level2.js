/**
 * OWNER: Person D (wording, hints, real-world note)
 *          + Person C (objective `check` functions)
 *
 * LEVEL 2 — "Turn It Down"
 * The loop from level 1 is already on the board — but somebody bridged the
 * resistor's slot with a plain jumper. Nothing is limiting the current, so the
 * LED is being driven far past what it can take. The player has to pull that
 * jumper and put a resistor in its place.
 *
 * Teaching point: a resistor is not decoration. It sets how much current flows,
 * and that is what decides how hard (and how long) the light runs.
 */

/** @typedef {import('../../shared/types.js').Level} Level */

/** @type {Level} */
export const level2 = {
  id: 'level-2',
  title: 'Turn It Down',
  brief:
    'The loop works, but there is nothing in it slowing the electricity down, so the ' +
    'LED is running flat out. Find the shortcut, take it out, and put a resistor in ' +
    'its place so the light settles to something you can live with.',

  tray: [
    { type: 'wire', count: Infinity },
    { type: 'battery', count: 1 },
    { type: 'switch', count: 1 },
    { type: 'led', count: 1 },
    { type: 'resistor', count: 1 },
  ],

  /*
   * The finished level-1 circuit, minus the resistor. `bridge` is the jumper
   * sitting where the resistor belongs. Ids use a `pre-` prefix so they can
   * never collide with the ones makeId() hands out during play.
   */
  preplaced: [
    { id: 'pre-battery', type: 'battery', holes: ['TP1', 'TN1'], state: {} },
    { id: 'pre-feed', type: 'wire', holes: ['TP5', 'A5'], state: {} },
    { id: 'pre-switch', type: 'switch', holes: ['A5', 'A9'], state: { closed: true } },
    { id: 'pre-bridge', type: 'wire', holes: ['B9', 'B13'], state: {} },
    { id: 'pre-led', type: 'led', holes: ['B13', 'B17'], state: {} },
    { id: 'pre-return', type: 'wire', holes: ['A17', 'TN5'], state: {} },
  ],

  objectives: [
    {
      id: 'loop',
      description: 'Keep one complete loop from + back to −',
      check: ({ resultClosed }) => resultClosed.complete && !resultClosed.shorted,
    },
    {
      id: 'resistor-in-loop',
      description: 'Put the resistor in the path of the current',
      check: ({ resultClosed, placements }) => {
        const resistor = placements.find((p) => p.type === 'resistor');
        if (!resistor) return false;
        return resultClosed.components[resistor.id]?.energized === true;
      },
    },
    {
      id: 'dimmed',
      description: 'With the switch CLOSED, the LED glows without burning out',
      check: ({ resultClosed, placements }) => {
        const led = placements.find((p) => p.type === 'led');
        if (!led) return false;
        const result = resultClosed.components[led.id];
        return result?.lit === true && result.burnedOut === false;
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
  ],

  hints: [
    'Follow the loop with your finger. Between the switch and the LED there is a plain jumper wire — that is the shortcut letting all the current through.',
    'Drag the jumper between the switch and the LED off the board to take it away. The loop breaks, and that is fine — you are about to fill the gap.',
    'Put the resistor where the jumper was, one leg in the switch’s strip and one in the LED’s. It does not care which way round it goes.',
    'A resistor works like a narrow section of pipe: the same push from the battery moves less current through it, so the LED gets what it needs and no more.',
  ],

  realWorld: {
    title: 'You just built a dimmer',
    body:
      'Every LED you own has a resistor next to it for exactly this reason. The battery ' +
      'pushes as hard as it can; the resistor decides how much actually gets through. ' +
      'A bigger resistor means less current and a dimmer, cooler light that lasts for ' +
      'years — a dimmer knob is the same idea with a resistor you can adjust.',
  },
};
