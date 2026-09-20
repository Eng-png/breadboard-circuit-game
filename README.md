# Lights Out

A short story game that teaches the basics of electronics by making you build a
real circuit on a real breadboard.

You get home after dark. The lights do not work. Behind a panel on the wall
there is a breadboard with every part pulled out of it. If you want light
tonight, you are going to have to put the circuit back together.

**Level 1** is battery, switch, resistor, LED. Get it wrong and the game tells
you *why* in plain English: the LED is backwards, both legs are in the same
strip, nothing is limiting the current. Get it right and the room lights up
around you — and flipping the switch back off makes it dark again, because that
is what a switch is.

## Quick start

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | 43 tests: the solver, and full playthroughs of Levels 1 and 2 |
| `npm run lint` | Static checks |
| `npm run build` | Production build into `dist/` |

## The breadboard is real

Holes in the same five-hole strip are already joined by copper inside the board.
The channel down the middle really does split every column in two. Hole spacing
is 2.54 mm, the actual standard. Hover any hole and every hole it is already
connected to lights up — that one interaction teaches more than a paragraph can.

The circuit solver is ours: a union-find netlist over the board's copper, then a
series solve for current. No simulation library. Writing it is part of the point.

## Adding your art

Drop files into `public/assets/` using the names in
[public/assets/README.md](public/assets/README.md) and they appear on refresh —
no imports, no code changes. Until a file exists the game draws a styled
placeholder, so art and code never block each other.

For the breadboard image specifically, load the game with `?calibrate=1` and
drag the sliders until the holes line up, then paste the numbers into
`src/breadboard/boardSkin.js`.

## Layout

```
src/
  shared/      Hole ids and shared types — the vocabulary everything speaks
  engine/      Pure circuit solver. No React, no DOM, no pixels.
  breadboard/  SVG board, geometry, interaction, image skin
  game/        Game state and the puzzle panel
  ui/          Tray, objectives, hints
  story/       Beats, scenes, dialogue, the dark-to-lit transition
  content/     Parts catalog, level definitions, asset registry
```

The data flow is one-way: **content → breadboard → game state → engine → back
out as a result everything renders from.** The engine has never heard of a
living room; the story has never heard of Ohm's law. That separation is what
lets four people work at once.

## For the team

Read [TEAM_PLAN.md](TEAM_PLAN.md) — the 24-hour sprint, who owns what, and the
cut list. Then [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the contracts
between layers.

**Level 2 — Turn It Down.** The room is too bright: the Level 1 loop is already
on the board with a plain jumper where the resistor should be, so the LED is
being over-driven. Pull the jumper, drop the resistor in its place, and the
glare settles into a light you can live with. To add a Level 3, register a
level in `src/content/levels/` and a story in `src/story/` — the end beat of
Level 2 will offer it automatically.
