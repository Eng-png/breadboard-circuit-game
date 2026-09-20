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
| `backgrounds/toolbox.png` | The toolbox the parts tray is drawn inside | Transparent PNG, cropped tight to the artwork. Any aspect ratio works — the tray matches it. The parts are laid out as two centred rows on the box's two shelves; the inside of the frame is the four `--shelf-*` values in `src/game/PuzzlePanel.css` |

## Component art

Two drawings per part, by a naming convention the code reads directly:

| Suffix | Where it shows | Notes |
| --- | --- | --- |
| `…tool.png` | The icon in the toolbox, before the part is picked up | Square-ish, transparent. Letterboxed into a square slot |
| `…board.png` | The part sitting on the breadboard | Transparent. See mounting below |

A part that looks different in different states gets one `board` file per
state — `switchonboard.png` and `switchoffboard.png` — and one `tool` file for
the whole part, since the toolbox shows it before it has a state.

### What is here

| File | Part | |
| --- | --- | --- |
| `ledtool.png` / `ledboard.png` | LED | One bulb drawing; the game dims it when the LED is off and greys it when burnt out |
| `switchonofftool.png` | Switch | |
| `switchonboard.png` / `switchoffboard.png` | Switch | Closed and open |
| `pottool.png` / `potboard.png` | Dimmer | The pointer showing the setting is drawn on top, so leave the centre of the dial clear |
| `resblue.png` | Resistor | Does both jobs — add `restool.png` / `resboard.png` to split them |

Still missing, so they draw their SVG placeholder: **battery** and **jumper
wire** (`batterytool.png`, `batteryboard.png`, `wiretool.png`, `wireboard.png`).

### How a board drawing meets the holes

A part occupies two holes, and the drawing is lined up with them: the code is
told where the drawing's legs are, and it puts those two points on those two
holes. What you see then sits exactly on the nodes the circuit solver is using.

That means every `board` file must be **cropped tight to the artwork** — no
transparent margin — so the leg positions can be given as simple fractions of
the image. Each entry in `COMPONENT_ART` (`src/content/assets.js`) carries:

| Field | What it is |
| --- | --- |
| `width` / `height` | How big the part is in board millimetres. One hole pitch is 2.54 |
| `legs` | The two points that plug into holes, as `[x, y]` fractions of the image: `[0, 0]` is top-left, `[1, 1]` bottom-right |
| `heart` | Optional. The middle of the part, for the LED's glow and the dimmer's pointer to hang off. Defaults to the centre of the image |

Two shapes cover everything so far:

- Drawn front-on, standing on its legs (LED, switch, dimmer) — both legs along
  the bottom edge, e.g. `legs: [[0.32, 1], [0.68, 1]]`. The part stands *on*
  the line between the holes.
- Drawn lying down, a lead out of each end (resistor) — `legs: [[0.49, 0],
  [0.49, 1]]`. The part lies *along* the line between the holes.

When the two holes are further apart than the drawing's own legs — and they
usually are — the body stays the size it should be and the leads splay out to
reach, the way bending a real component's legs looks. Nothing is stretched.

### Save with a hard alpha edge

Every pixel should be fully opaque or fully transparent. All this art is drawn
with `image-rendering: pixelated`, so a soft anti-aliased edge — and especially
the near-invisible halo some exporters leave around a sprite — is magnified
into a visible dark fringe round the part. Exporting from a pixel-art tool at
1x gives you this for free; exporting an upscaled or generated image usually
does not.

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
