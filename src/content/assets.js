/**
 * OWNER: Person D (Content & Art)
 *
 * Every image the game can use, in one place, with a placeholder to fall back
 * on when the file is not there yet.
 *
 * This is what lets art and code proceed in parallel on a 24-hour clock: the
 * game runs correctly with zero image files present, and each drop-in improves
 * it without anyone touching a component.
 *
 * See public/assets/README.md for the filenames and sizes expected.
 */

const BASE = '/assets';

/**
 * @typedef {object} AssetSpec
 * @property {string} src        URL under public/
 * @property {string} alt        Describe it for screen readers AND for teammates
 * @property {string} fallback   CSS background used until the file exists
 */

/** @type {Record<string, AssetSpec>} */
export const BACKGROUNDS = {
  'house-exterior-night': {
    src: `${BASE}/backgrounds/house-exterior-night.png`,
    alt: 'A small house at night, windows dark, porch light out',
    fallback: 'linear-gradient(180deg, #141c2e 0%, #1e2a44 55%, #0d1220 100%)',
  },
  'living-room-dark': {
    src: `${BASE}/backgrounds/living-room-dark.png`,
    alt: 'A living room in near-total darkness, shapes barely visible',
    fallback: 'linear-gradient(180deg, #0c0f16 0%, #151a26 100%)',
  },
  'living-room-lit': {
    src: `${BASE}/backgrounds/living-room-lit.png`,
    alt: 'The same living room, warmly lit',
    fallback: 'linear-gradient(180deg, #4a3a22 0%, #6b5233 60%, #3a2c19 100%)',
  },
};

/** @type {Record<string, AssetSpec>} */
export const PROPS = {
  'panel-closed': {
    src: `${BASE}/props/panel-closed.png`,
    alt: 'A closed electrical panel on the wall',
    fallback: 'linear-gradient(180deg, #2a2f3a 0%, #1b1f28 100%)',
  },
};

/**
 * The desk fan in the room, one frame per head position. Frame 1 faces right,
 * frame 5 faces left; played 1→5→1 it sweeps like an oscillating fan.
 *
 * The PNG canvases are all slightly different sizes, so each frame carries its
 * pixel size and the bottom-centre of the fan's base (`anchor`). FanProp draws
 * every frame at the same scale (relative to `FAN_REF_WIDTH` source pixels)
 * and pins the anchor to one spot, so only the head moves between frames.
 * If you re-export the art, update these numbers to the new base position.
 */
export const FAN_REF_WIDTH = 260;
export const FAN_FRAMES = [
  { src: `${BASE}/props/fan/fan-1.png`, width: 247, height: 334, anchor: [128, 316] },
  { src: `${BASE}/props/fan/fan-2.png`, width: 239, height: 358, anchor: [118, 316] },
  { src: `${BASE}/props/fan/fan-3.png`, width: 232, height: 342, anchor: [123, 316] },
  { src: `${BASE}/props/fan/fan-4.png`, width: 245, height: 343, anchor: [109, 316] },
  { src: `${BASE}/props/fan/fan-5.png`, width: 217, height: 369, anchor: [102, 311] },
];

/**
 * Level 4's control gear. Both are drawn as SVG placeholders until the PNG is
 * on disk (see public/assets/README.md).
 */
export const ARDUINO_IMAGE = `${BASE}/props/arduino.png`;
export const LIMIT_SWITCH_IMAGE = `${BASE}/props/limit-switch.png`;

export const BREADBOARD_IMAGE = `${BASE}/breadboard/breadboard.png`;

/** The open toolbox the parts tray is drawn inside. */
export const TOOLBOX_IMAGE = `${BASE}/backgrounds/toolbox.png`;

/**
 * One picture per part, shown in the tray.
 *
 * Drop a PNG at any of these paths and it replaces the drawn placeholder on
 * refresh — no code change. Until then the tray draws the part's own SVG art,
 * which is the same art the board uses, so the tray and the board always agree.
 *
 * Square images work best; they are letterboxed into a square slot.
 *
 * @type {Record<import('../shared/types.js').ComponentType, string>}
 */
export const COMPONENT_IMAGES = {
  wire: `${BASE}/components/wire.png`,
  battery: `${BASE}/components/battery.png`,
  led: `${BASE}/components/led-off.png`,
  resistor: `${BASE}/components/resistor.png`,
  switch: `${BASE}/components/switch-open.png`,
  // Shared with COMPONENT_ART below: one drawing of the dimmer does both jobs.
  potentiometer: `${BASE}/components/potentiometer.png`,
  fan: `${BASE}/components/fan.png`,
};

/**
 * @param {string} type
 * @returns {string} '' when this part has no image slot at all
 */
export function componentImage(type) {
  return COMPONENT_IMAGES[type] ?? '';
}

/**
 * Optional bitmap art for parts on the board. A part with an entry here is
 * drawn from the PNG when the file exists and from its SVG placeholder when it
 * does not. Drawn centred on the part, long axis along the leads.
 *
 * @type {Record<string, { src: string, alt: string, width: number, height: number }>}
 *   width/height are in board millimetres (one hole pitch is 2.54).
 */
export const COMPONENT_ART = {
  potentiometer: {
    src: `${BASE}/components/potentiometer.png`,
    alt: 'A small blue trimmer potentiometer with a white dial',
    width: 9,
    height: 9,
  },
};

/**
 * @param {string} name
 * @returns {AssetSpec}
 */
export function background(name) {
  return (
    BACKGROUNDS[name] ?? {
      src: '',
      alt: '',
      fallback: 'linear-gradient(180deg, #1a1f2b, #0d1118)',
    }
  );
}
