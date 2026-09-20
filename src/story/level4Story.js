/**
 * OWNER: Person D (writing) / Person C (beat structure)
 *
 * LEVEL 4 — "Fresh Air"
 *
 * The room is lit and comfortable after level 3, and now it is warm. This is
 * the first story with a prop in the room: the desk fan (see FanProp), which
 * sweeps right → left → right while the fan motor on the board is turning.
 * `props: ['fan']` puts it in the scene; a beat's `fanSpeed` runs it during
 * narrative beats, and during the puzzle the circuit drives it live.
 */

export const level4Story = {
  id: 'level-4',
  title: 'Fresh Air',
  chapter: 'Level 4',
  props: ['fan'],

  beats: [
    {
      id: 'warm',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 0,
      mode: 'narrative',
      lines: [
        'The reading light is perfect. The room, it turns out, is not.',
        'It is stuffy in here — the kind of warm that makes the pages stick to your fingers.',
        'In the corner there is a small pink desk fan, pointed hopefully at the sofa. It is not moving.',
      ],
      advance: 'Follow its cable',
      next: 'panel',
    },

    {
      id: 'panel',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 0,
      mode: 'narrative',
      lines: [
        'The fan’s cable runs to the panel and simply stops. The battery is there. The wires to and from the rails are there.',
        'Between them: nothing. A twelve-column gap where the fan, and a switch, are supposed to go.',
        'No resistor in the note this time. Just a drawing of a fan with an arrow through it, and the words “it is its own.”',
      ],
      advance: 'Open the toolbox',
      next: 'puzzle',
    },

    {
      id: 'puzzle',
      background: 'living-room-lit',
      light: 0.6,
      mode: 'puzzle',
      lines: [
        'Wire the switch and the fan into the gap, then close the switch. Watch the fan in the corner — and try the switch both ways.',
      ],
      resolve: 'A hum. Then the fan turns its head, slowly, to the left — and the first breath of moving air crosses the room.',
      resolveLabel: 'Sit in front of it',
      next: 'solved',
    },

    {
      id: 'solved',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 1,
      mode: 'narrative',
      lines: [
        'The fan is a motor: a coil of wire that pushes against a magnet when current runs through it.',
        'It did not need a resistor because that coil *is* one — 300 Ω of thin copper wire. The motor limits its own current.',
        'More current, faster fan. Less current, slower. Hold onto that thought.',
      ],
      advance: 'Lean back',
      next: 'rest',
    },

    {
      id: 'rest',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 1,
      mode: 'end',
      lines: [
        'Light you can read by. Air you can breathe. The fan sweeps the room like it is keeping watch.',
        'Slip the resistor into the loop and the fan slows to a lazy turn; pull it out and it races. Same handful of parts, and still more to learn from them.',
      ],
      advance: null,
      next: null,
    },
  ],
};
