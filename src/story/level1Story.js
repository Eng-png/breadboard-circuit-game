/**
 * OWNER: Person D (writing) / Person C (beat structure)
 *
 * LEVEL 1 — "Lights Out"
 *
 * The story is data, not code. Add a beat to this array and it appears in the
 * game; nobody has to touch StoryScreen.jsx. That is deliberate — on a 24-hour
 * clock, the writer must not be blocked on the person holding the state machine.
 *
 * BEAT SHAPE
 *   id          unique, used for the story's current position
 *   background  a key from src/content/assets.js BACKGROUNDS
 *   light       0..1, how lit the scene is. During the puzzle this is ignored
 *               and driven live by the circuit instead.
 *   lines       what the player reads, in order
 *   mode        'narrative' (click through) | 'puzzle' (the breadboard) | 'end'
 *   next        id of the following beat, or null
 *   advance     button label for narrative beats
 */

/** @typedef {import('../shared/types.js').Level} Level */

export const level1Story = {
  id: 'level-1',
  title: 'Lights Out',

  beats: [
    {
      id: 'arrive',
      background: 'house-exterior-night',
      light: 0.5,
      mode: 'narrative',
      lines: [
        'Home. It took longer than it should have.',
        'The porch light is dead. That is new — it was working this morning.',
      ],
      advance: 'Go inside',
      next: 'enter',
    },

    {
      id: 'enter',
      background: 'living-room-dark',
      light: 0.08,
      mode: 'narrative',
      lines: [
        'You reach for the switch by the door out of pure habit. Click. Click.',
        'Nothing. The whole room stays black.',
      ],
      advance: 'Feel along the wall',
      next: 'panel',
    },

    {
      id: 'panel',
      background: 'living-room-dark',
      light: 0.1,
      mode: 'narrative',
      lines: [
        'Your hand finds a panel cover, slightly warm, hanging open on one hinge.',
        'Inside there is a breadboard. Someone has pulled every part out of it.',
        'If you want light tonight, you are going to have to put the circuit back together.',
      ],
      advance: 'Get to work',
      next: 'puzzle',
    },

    {
      id: 'puzzle',
      background: 'living-room-dark',
      mode: 'puzzle',
      lines: [
        'Rebuild the circuit. Electricity has to leave the battery, pass through ' +
          'everything, and get all the way back — or nothing happens.',
      ],
      next: 'solved',
    },

    {
      id: 'solved',
      background: 'living-room-lit',
      light: 1,
      mode: 'narrative',
      lines: [
        'The room comes up all at once. Furniture, a rug, your own coat on the floor.',
        'You flick the switch off, then on again, just to watch it obey you.',
        'That is all a light switch has ever been: a gap in a loop that you control.',
      ],
      advance: 'Look around',
      next: 'toobright',
    },

    /*
     * END OF LEVEL 1.
     *
     * This beat is the hook that level 2 hangs off — the room is now painfully
     * bright, which is the problem level 2 solves. Level 2 itself is NOT built
     * and must not be started here. When someone does build it, they add a
     * `next: 'level-2-something'` and a new story file; nothing in this one changes.
     */
    {
      id: 'toobright',
      background: 'living-room-lit',
      light: 1,
      mode: 'end',
      lines: [
        'Except — it is too much. The bulb is running flat out and the glare is painful.',
        'There is nothing in the circuit telling the electricity to slow down.',
        'You look back at the breadboard. There has to be a way to turn it down.',
      ],
      advance: null,
      next: null,
    },
  ],
};

/** @param {string} id */
export function getBeat(id) {
  return level1Story.beats.find((beat) => beat.id === id) ?? level1Story.beats[0];
}

export const FIRST_BEAT = level1Story.beats[0].id;
