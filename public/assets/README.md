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

## Level 4

| Path | What it is | Notes |
| --- | --- | --- |
| `props/fan/fan-1.png` … `fan-5.png` | The desk fan in the corner of the room, one frame per head position | **In place.** Frame 1 faces right, frame 5 faces left. While the fan motor on the board is turning, `FanProp` steps through them; at an end it stalls unless a limit switch is there, in which case it turns back. Transparent PNGs, roughly 240×350 but not identical, so `FAN_FRAMES` in `src/content/assets.js` records each frame's size and the bottom-centre of its base; all five are drawn at one scale with that point pinned, so only the head moves. If you re-export a frame, update its `width`/`height`/`anchor` there. |
| `components/fan.png` | The fan motor part, for the tray | Optional. Square, transparent. Until it exists a pink SVG placeholder with spinning blades is drawn. |
| `props/arduino.png` | The small Arduino docked above the breadboard | Landscape, transparent, roughly 2:1.4 (a real Uno is 69×53 mm). Drawn about 120–180 px wide. Until it exists a blue SVG placeholder board is drawn, with two input lights that blink when a limit switch is pressed — if you supply art, those lights are lost, so leave room for them or tell us. |
| `props/limit-switch.png` | One limit switch (micro switch with a lever arm and two wires coming off the back) | Square-ish, transparent, wires exiting bottom-left. Drawn about 48–72 px wide and mirrored for the right-hand end. Both switches share the one image. Until it exists an SVG placeholder is drawn. |

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
| `components/fan.png` | Fan motor |

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
