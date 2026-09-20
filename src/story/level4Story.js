/**
 * OWNER: Person D (writing) / Person C (beat structure)
 *
 * LEVEL 4 — "Fresh Air"
 *
 * The first story that leaves the breadboard. `props: ['fan', 'limit-switches']`
 * puts the desk fan in the room and, during the puzzle, the two limit switches
 * on the floor beside it and the Arduino docked above the board. The fan runs
 * from the fan motor on the board; at each end of its sweep it either presses
 * a limit switch and turns back, or stalls because there is nothing there.
 *
 * Narrative beats can run the fan with `fanSpeed` (0..1) and declare which
 * ends are guarded with `limits: { left, right }`.
 */

export const level4Story = {
  id: 'level-4',
  title: 'Fresh Air',
  chapter: 'Level 4',
  props: ['fan', 'limit-switches'],

  beats: [
    {
      id: 'still',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 0,
      mode: 'narrative',
      lines: [
        'The reading light is perfect. The room, it turns out, is not.',
        'In the corner there is a small pink desk fan, pointed hopefully at the sofa. It is not moving.',
        'Taped to the wall above the panel is something new: a little blue circuit board the size of a playing card, and two tiny switches with lever arms dangling from it on thin wires.',
      ],
      advance: 'Have a closer look',
      next: 'arduino',
    },

    {
      id: 'arduino',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 0,
      mode: 'narrative',
      lines: [
        'The board says ARDUINO. It is a small computer: it reads inputs and decides what to do about them.',
        'The two switches on wires are limit switches — “limit” as in the edge of how far something is allowed to go. Press the lever and the Arduino hears about it.',
        'A note in the same handwriting as before: “The fan turns. It does not know when to stop. Teach it.”',
      ],
      advance: 'Go to the panel',
      next: 'puzzle',
    },

    {
      id: 'puzzle',
      background: 'living-room-lit',
      light: 0.6,
      mode: 'puzzle',
      lines: [
        'The loop has a gap: the feed wire stops at column 5, the return wire starts at column 17.',
        'Wire the fan in, with a switch so you can stop it. Then watch the fan — and when it runs out of room, put a limit switch where its head arrives.',
      ],
      resolve:
        'The head reaches the end, taps the switch, and the Arduino swings it back the other way. Then the other switch. Then back again. Air moves across the room in slow, even passes.',
      resolveLabel: 'Sit back down',
      next: 'done',
    },

    {
      id: 'done',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 1,
      limits: { left: true, right: true },
      mode: 'end',
      lines: [
        'A motor only knows how to turn. It took two switches and a small computer to teach it where the edges are.',
        'That is most machines, when you look: something that moves, something that notices, and something in between that decides.',
      ],
      advance: null,
      next: null,
    },
  ],
};
