/**
 * OWNER: Person D (Content & Component Library)
 *
 * The parts catalog. Person A reads `electrical`, Person B reads `pins`,
 * Person C reads `label`/`blurb`. Add a part here and it becomes available to
 * every level — nothing else needs to change.
 *
 * Numbers are chosen to be realistic AND to make the teaching point land:
 * a 9 V battery with a 330 ohm resistor gives ~21 mA, a healthy LED current,
 * while no resistor at all blows past maxCurrentMa and burns the LED out.
 */

/** @typedef {import('../shared/types.js').ComponentDef} ComponentDef */

/** @type {Record<string, ComponentDef>} */
export const COMPONENTS = {
  wire: {
    type: 'wire',
    label: 'Jumper wire',
    blurb: 'A path for electricity. Both ends become the same point in the circuit.',
    pins: [
      { name: 'a', label: 'End A' },
      { name: 'b', label: 'End B' },
    ],
    polarized: false,
  },

  battery: {
    type: 'battery',
    label: '9 V battery',
    blurb: 'Pushes electricity around the loop. Current leaves + and returns to −.',
    pins: [
      { name: 'pos', label: '+ (red)' },
      { name: 'neg', label: '− (black)' },
    ],
    polarized: true,
    electrical: { volts: 9 },
  },

  led: {
    type: 'led',
    label: 'LED',
    blurb: 'Lights up — but only when current flows in through its long leg.',
    pins: [
      { name: 'anode', label: '+ anode (long leg)' },
      { name: 'cathode', label: '− cathode (short leg, flat side)' },
    ],
    polarized: true,
    electrical: {
      forwardVolts: 2,
      minCurrentMa: 2,
      maxCurrentMa: 30,
      nominalCurrentMa: 20,
    },
  },

  resistor: {
    type: 'resistor',
    label: '330 Ω resistor',
    blurb: 'Limits how much current flows, so the LED survives.',
    pins: [
      { name: 'a', label: 'Lead A' },
      { name: 'b', label: 'Lead B' },
    ],
    polarized: false,
    electrical: { ohms: 330 },
  },

  potentiometer: {
    type: 'potentiometer',
    label: 'Dimmer (potentiometer)',
    blurb: 'A resistor with a knob. Turn it up for more resistance and a dimmer light.',
    pins: [
      { name: 'a', label: 'Lead A' },
      { name: 'b', label: 'Lead B' },
    ],
    polarized: false,
    // In series with the 330 Ω resistor: ~21 mA fully down, ~5 mA fully up.
    electrical: { minOhms: 0, maxOhms: 1000 },
  },

  fan: {
    type: 'fan',
    label: 'Desk fan',
    blurb: 'A small motor. Give it current and it turns — no resistor needed, the motor is its own load.',
    pins: [
      { name: 'a', label: 'Lead A' },
      { name: 'b', label: 'Lead B' },
    ],
    polarized: false,
    // 9 V across 300 Ω of windings is 30 mA: full speed.
    electrical: { ohms: 300, minCurrentMa: 5, nominalCurrentMa: 30 },
  },

  switch: {
    type: 'switch',
    label: 'Push switch',
    blurb: 'A gap you can open and close on purpose. Closed = current passes.',
    pins: [
      { name: 'a', label: 'Terminal A' },
      { name: 'b', label: 'Terminal B' },
    ],
    polarized: false,
  },
};

/**
 * @param {import('../shared/types.js').ComponentType} type
 * @returns {ComponentDef}
 */
export function getComponent(type) {
  const def = COMPONENTS[type];
  if (!def) throw new Error(`Unknown component type: ${type}`);
  return def;
}
