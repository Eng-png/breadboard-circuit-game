/**
 * OWNER: Person D (Content) / Person C (format)
 *
 * LEVEL 4 — "Fresh Air"
 *
 * The first load that is not a light. A desk fan is a small motor: put current
 * through it and it turns; more current, faster. Unlike the LED it is its own
 * resistance, so it needs no protecting resistor — and it does not care which
 * way round it goes in.
 *
 * The battery and both rail wires are on the board. The player wires a switch
 * and the fan into the gap between them, then flips the switch: the fan on
 * the board spins, and the fan standing in the room sweeps left and right.
 *
 * Board layout:
 *   TP1/TN1   battery          [gap: column 5 -> column 17]
 *   TP5-A5    feed wire        A17-TN5  return wire
 *
 * The 330 Ω resistor is in the tray on purpose: put it in series and the fan
 * still turns, just slower. That is the seed of level 5.
 */

const fanOf = (placements) => placements.find((p) => p.type === 'fan');

/** @type {import('../../shared/types.js').Level} */
export const level4 = {
  id: 'level-4',
  title: 'Fresh Air',
  brief:
    'The light works. The room is stuffy. There is a fan in the corner and a ' +
    'gap in the loop on the panel — wire the fan in, with a switch so you can ' +
    'stop it, and get some air moving.',

  tray: [
    { type: 'wire', count: Infinity },
    { type: 'battery', count: 1 },
    { type: 'switch', count: 1 },
    { type: 'fan', count: 1 },
    { type: 'resistor', count: 1 },
  ],

  preplaced: [
    { id: 'pre-battery', type: 'battery', holes: ['TP1', 'TN1'], state: {} },
    { id: 'pre-feed', type: 'wire', holes: ['TP5', 'A5'], state: {} },
    { id: 'pre-return', type: 'wire', holes: ['A17', 'TN5'], state: {} },
  ],

  objectives: [
    {
      id: 'loop',
      description: 'Close the loop from + back to −',
      check: ({ resultClosed }) => resultClosed.complete && !resultClosed.shorted,
    },
    {
      id: 'fan-on',
      description: 'With the switch CLOSED, the fan turns',
      check: ({ resultClosed, placements }) => {
        const fan = fanOf(placements);
        if (!fan) return false;
        return resultClosed.components[fan.id]?.spinning === true;
      },
    },
    {
      id: 'fan-off',
      description: 'With the switch OPEN, the fan stops',
      check: ({ resultOpen, placements }) => {
        const fan = fanOf(placements);
        if (!fan) return false;
        return resultOpen.components[fan.id]?.spinning !== true;
      },
    },
  ],

  hints: [
    'The feed wire ends at column 5 and the return wire starts at column 17. Everything you add goes between them.',
    'A fan has no + or −. Either way round works — try it.',
    'Put the switch first: drag it onto column 5 and pull its far leg to column 9. Then the fan from column 9 to column 17.',
    'No resistor needed this time. A motor’s own windings resist the current — 300 Ω of them. If you add the resistor anyway, watch what happens to the speed.',
    'Nothing moving? The switch is probably open. Tap it.',
  ],

  realWorld: {
    title: 'A motor is a load too',
    body:
      'Everything that uses electricity to do work — a bulb, a motor, a heater, a ' +
      'phone — is a load, and every load has resistance. A motor’s is the long coil ' +
      'of wire inside it. That resistance is why you can wire a small fan straight ' +
      'to a battery when you could never do that with a bare LED: the motor limits ' +
      'its own current. Push more current through and it spins faster; that is what ' +
      'the speed dial on a real desk fan is doing.',
  },
};
