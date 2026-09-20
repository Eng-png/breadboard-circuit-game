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

  /*
   * Three pins, like the real part: one resistive track running between the
   * two outer pins, and a wiper in the middle that slides along it. The knob
   * moves the wiper, which is what splits the track into two halves —
   *
   *   pin A ──/\/\/\──┬──/\/\/\── pin B
   *                   wiper
   *
   * Take your output from an end and the wiper and you get part of the track,
   * and the knob changes how much: that is a rheostat, and it is how a dimmer
   * is wired. Use the two ends alone and you get the whole track, fixed,
   * whatever the knob says — which is the mistake worth making once.
   */
  potentiometer: {
    type: 'potentiometer',
    label: 'Dimmer (potentiometer)',
    blurb:
      'A resistive track with a sliding contact. The outer pins are the ends of ' +
      'the track; the middle pin is the wiper the knob moves along it.',
    pins: [
      { name: 'a', label: 'End A (the side current comes in)' },
      { name: 'wiper', label: 'Wiper — the middle pin the knob moves' },
      { name: 'b', label: 'End B (the side that goes to ground)' },
    ],
    polarized: false,
    // The whole track. In series with the 330 Ω resistor that is ~21 mA with
    // the wiper at one end, ~5 mA with it at the other.
    electrical: { trackOhms: 1000 },
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
