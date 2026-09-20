/**
 * OWNER: Person D (wording, hints, real-world note)
 *          + Person C (objective `check` functions)
 *
 * LEVEL 4 — "Fresh Air"
 * The light is sorted; the air is not. A desk fan stands in the corner and a
 * small Arduino is docked above the panel with two limit switches hanging off
 * it. The board half is simple on purpose: battery → switch → fan, the same
 * loop as level 1 with the fan as the load. Then the lesson moves off the
 * board: a bare motor turns until it runs into the end of its travel and
 * stalls there. A limit switch at that end is pressed by the head, the
 * Arduino reads the press and reverses the motor. One switch each end and the
 * fan sweeps back and forth on its own.
 *
 * The limit switches are not board parts. They live in the room (see
 * story/useLimitSwitches.js), never snap to holes, and are checked by the
 * story screen, not here — this file owns only the electrical half.
 *
 * Board layout:
 *   TP1/TN1   battery          [gap: column 5 -> column 17]
 *   TP5-A5    feed wire        A17-TN5  return wire
 */

const fanOf = (placements) => placements.find((p) => p.type === 'fan');

/** @type {import('../../shared/types.js').Level} */
export const level4 = {
  id: 'level-4',
  title: 'Fresh Air',
  brief:
    'The light works. The room is stuffy. Wire the fan into the gap on the panel, ' +
    'with a switch so you can stop it, then hang a limit switch at each end of the ' +
    'fan’s sweep so the Arduino can turn it back before it grinds.',

  tray: [
    { type: 'wire', count: Infinity },
    { type: 'battery', count: 1 },
    { type: 'switch', count: 1 },
    { type: 'fan', count: 1 },
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
    'Once the fan turns, watch it reach the end and stop. Drag a limit switch to that side of the head — right up against where it stopped.',
    'The Arduino needs a switch at BOTH ends, or the fan only ever turns round once.',
  ],

  realWorld: {
    title: 'How a machine knows where its edges are',
    body:
      'A motor has no idea where it is. Left to itself it will drive a fan head, a ' +
      'garage door or a 3D-printer bed straight into the end of its travel and keep ' +
      'pushing. A limit switch is the fix: a tiny switch with a lever, mounted where ' +
      'the moving part arrives. The part presses it, the switch closes, and a ' +
      'controller — here an Arduino — sees that input and does something about it: ' +
      'stop, or reverse. Two limit switches and a few lines of code are what turn a ' +
      'motor that only spins into a fan that sweeps the room.',
  },
};
