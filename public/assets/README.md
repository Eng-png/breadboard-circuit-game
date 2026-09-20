# Assets — drop files here

Anything in `public/` is served at the site root. A file at
`public/assets/backgrounds/house-exterior-night.png` is reachable in code as
`/assets/backgrounds/house-exterior-night.png`. No imports, no rebuild step —
drop the file in and refresh.

**Use these exact filenames** and the game picks them up automatically. Until a
file exists the game draws a styled placeholder instead, so nothing breaks while
art is still in progress.

## Level 1

| Path | What it is | Notes |
| --- | --- | --- |
| `backgrounds/house-exterior-night.png` | Outside the house, night | First thing the player sees |
| `backgrounds/living-room-dark.png` | The room, lights off | Player spends most of the level here |
| `backgrounds/living-room-lit.png` | The same room, lights on | **Same camera angle as the dark one** — the whole payoff is the cut between them |
| `breadboard/breadboard.png` | The breadboard itself | See calibration note below |
| `props/panel-closed.png` | Wall panel, shut | Optional |
| `backgrounds/toolbox.png` | The open toolbox the parts tray is drawn inside | Transparent PNG. Any aspect ratio works — the tray matches it |

## Level 3

| Path | What it is | Notes |
| --- | --- | --- |
| `components/potentiometer.png` | The dimmer knob part, seen from above | **Square, transparent background**, roughly 512×512. Drawn 9 mm wide on the board (about 3.5 hole pitches) with the leads running left–right. Until the file exists a blue SVG placeholder is drawn instead. The black pointer that shows the knob position is drawn on top of your image, so leave the centre of the dial clear. Size/alt live in `src/content/assets.js` (`COMPONENT_ART`). |

## Component art

One picture per part, shown in the tray. These are the slots the tray reads:

| Path | Part |
| --- | --- |
| `components/wire.png` | Jumper wire |
| `components/battery.png` | 9 V battery |
| `components/led-off.png` | LED |
| `components/resistor.png` | 330 Ω resistor |
| `components/switch-open.png` | Push switch |
| `components/potentiometer.png` | Dimmer — shared with the board art above |

Square, transparent PNGs. They are letterboxed into a square slot, so anything
roughly 1:1 (128×128 is plenty) looks right.

Until a file exists the slot draws the part's own SVG art — the same art that
appears on the board — so the tray is never empty and never wrong.

### Where the slots sit in the toolbox

The parts row is positioned as a percentage of `toolbox.png`, so it tracks the
artwork at any size. If you swap the picture for one with a differently shaped
compartment, retune the four `--slot-*` values at the top of the toolbox block
in `src/game/PuzzlePanel.css` and nothing else.

## Format

- **PNG** with transparency where it matters, or JPG for full-bleed backgrounds.
- Backgrounds: **1920×1080**. They are object-fit: cover, so anything 16:9 works.
- Keep each file under ~500 KB. Four backgrounds at 3 MB each makes the page
  crawl on school wifi, and nobody notices the quality difference.

## Breadboard calibration

The hole grid is drawn from real measurements (2.54 mm pitch), so it will not
line up with your image by accident. Once `breadboard/breadboard.png` is in
place:

1. Run the game with `?calibrate=1` on the URL.
2. Drag the sliders until the hole dots sit in the image's holes.
3. Copy the numbers it prints into `src/breadboard/boardSkin.js`.

Takes about two minutes. Until you do it, the game draws its own board and
ignores the image.
