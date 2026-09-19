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

## Component art (optional)

`components/battery.png`, `led-off.png`, `led-on.png`, `resistor.png`,
`switch-open.png`, `switch-closed.png`

These are optional. There is already working SVG art for every part that scales
cleanly and shows polarity. Only add PNGs if they look better.

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
