/**
 * OWNER: Person D (writing) / Person C (beat structure)
 *
 * LEVEL 4 — "Fresh Air" (animation preview)
 *
 * The first story with a prop in the room: the desk fan (see FanProp), which
 * sweeps right → left → right through its five frames. `props: ['fan']` puts
 * it in the scene and each beat's `fanSpeed` (0 still .. 1 full) runs it.
 *
 * There is no puzzle beat yet — this exists to show the fan animating. Add a
 * `mode: 'puzzle'` beat here and a circuit in content/levels/level4.js when
 * the level is designed.
 */

export const level4Story = {
  id: 'level-4',
  title: 'Fresh Air',
  chapter: 'Level 4',
  props: ['fan'],

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
      ],
      advance: 'Switch it on',
      next: 'running',
    },

    {
      id: 'running',
      background: 'living-room-lit',
      light: 0.6,
      fanSpeed: 1,
      mode: 'end',
      lines: [
        'A hum. The fan turns its head, slowly, to the left — and back — and the first breath of moving air crosses the room.',
        'How it gets its power is a puzzle for another day.',
      ],
      advance: null,
      next: null,
    },
  ],
};
