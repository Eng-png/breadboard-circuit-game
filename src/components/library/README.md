# Component art

OWNER: Person D.

One `.jsx` file per part, each exporting a single SVG fragment. No `<svg>`
wrapper — these are rendered *inside* the board's SVG, so they inherit its
coordinate space.

## Conventions (agree these with Person B in week 1)

- **Units are millimetres**, matching `src/breadboard/geometry.js`. One hole pitch
  is `2.54`.
- Draw the part with its **first pin at the origin (0, 0)**, laid out along the
  positive x-axis. The board translates and rotates you into place.
- Take a `pins` prop: an array of `{ x, y }` in board space, so a part can stretch
  between two holes that are not the default distance apart.
- Colour comes from CSS custom properties, never hardcoded hex. That is what makes
  dark mode and the accessibility pass possible later.
- Anything that can be in more than one state (LED dark/lit, switch open/closed)
  takes it as a prop and renders both, rather than being two files.

## Parts needed for level 1

- `Wire.jsx` — a sagging curve between two points, colour by prop
- `Battery.jsx` — 9 V block, clearly marked + and −
- `Led.jsx` — **visibly longer anode leg**, flat side on the cathode, `lit` prop
- `Resistor.jsx` — 330 Ω, correct colour bands (orange, orange, brown, gold)
- `Switch.jsx` — push switch, `closed` prop

The LED's leg length and the switch's open gap are not decoration. They are how the
player learns which way round things go, so draw them large enough to actually read.
