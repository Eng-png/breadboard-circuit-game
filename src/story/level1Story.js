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
 *   glare       0..1, optional harsh white wash (an over-driven bulb)
 *   resolve     puzzle beats only — the line shown once the circuit is solved
 *   resolveLabel  puzzle beats only — the button that moves the story on
 */

/** @typedef {import('../shared/types.js').Level} Level */

export const level1Story = {
  id: 'level-1',
  title: 'Lights Out',
  chapter: 'Level 1',

  beats: [
    {
      id: 'arrive',
      background: 'living-room-dark',
      light: 0.5,
      mode: 'narrative',
      lines: [
        ' Oh shoot',
        'forgot my house is broken :(((((',
        'gotta fix this before fine shyte gets here or shell dump me :>',
        'ill start with fixing the lights',
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
      resolve: 'The bulb catches. Light spills out of the panel and across the floor.',
      resolveLabel: 'Stand up and look around',
      next: 'toobright',
    },

    /*
     * END OF LEVEL 1.
     *
     * The hook into level 2: the room is now painfully bright. An `end` beat
     * hands off to the next story in src/story/index.js — level2Story picks up
     * from exactly this moment.
     */
    {
      id: 'toobright',
      background: 'living-room-lit',
      light: 1,
      glare: 1,
      mode: 'end',
      lines: [],
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
