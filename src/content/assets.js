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

export const BREADBOARD_IMAGE = `${BASE}/breadboard/breadboard.png`;

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
