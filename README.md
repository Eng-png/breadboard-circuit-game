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

### Devin circuit helper

The in-game **Ask Watt** panel sends circuit questions through a server-side
Devin proxy. Copy `.env.example` to `.env.local` and set a dedicated service
user key, organization ID, and tutor session ID:

```env
DEVIN_API_KEY=cog_...
DEVIN_ORG_ID=org-...
DEVIN_SESSION_ID=devin-...
```

The service user needs `ManageOrgSessions` and `ViewOrgSessions`. Never use a
`VITE_` variable for the key: Vite exposes those values to the browser. Restart
`npm run dev` after changing `.env.local`.

On Vercel the same endpoint is served by the function in `api/devin-chat.js`.
Set the same `DEVIN_*` variables under the project's Environment Variables and
redeploy; nothing else is needed.

For a local demo using the personal key offered on Devin's **Devin API** page,
set `DEVIN_API_VERSION=v1` and `DEVIN_API_KEY=apk_user_...`. The organization
and session values are optional in this mode; the proxy creates a private tutor
session when the first question is asked. Personal v1 keys are a legacy option,
so use the v3 service-user configuration above for a deployed app.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | The solver, the main menu, full playthroughs of Levels 1, 2 and 3, and the level picker |
| `npm run lint` | Static checks |
| `npm run build` | Production build into `dist/` |

## How you play

The game opens on the *Watt's Wrong?* title screen: **Start game** begins
Level 1, **How to play** shows the basics, and the level list jumps straight to
any level. Start game sends the mouse running into the house before Level 1
opens. In play, the header has a **Menu** button and a 1/2/3 level picker. The
cursor is a paw everywhere, closing while a button is held.

Drag a part out of the tray and drop it on a hole — it lands spanning that hole
plus its own width, so one gesture places a whole component. After that, drag
its body to move it, drag either end to re-seat a single leg, and drag it off
the board to take it away. Tap a switch to flip it. Everything also works from
the keyboard: Enter on a tray part drops it, then arrow keys move it and Delete
removes it.

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
placeholder, so art and code never block each other. The title screen's pixel
background lives at `public/assets/menu-background-pixel.png`; the mouse sprite
at `public/assets/mouse-sprite.png` and the paw cursors at
`public/assets/cursor-paw-64.png` / `cursor-paw-pressed-64.png`.

The standalone menu prototype (`menu-index.html`, `app.js`, `styles.css`,
`server.js`) is kept for reference; the React port lives in `src/menu/`.

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
glare settles into a light you can live with.

**Level 3 — Reading Light.** The safe loop is back with a gap after the LED and
a potentiometer in the tray. Bridge the gap and a knob appears under the board:
more resistance, less current, dimmer room — live, as you drag. Settle on a soft
reading light to finish. The part is drawn as a blue SVG placeholder until
`public/assets/components/potentiometer.png` exists (see `public/assets/README.md`).

To add a Level 4, register a level in `src/content/levels/` and a story in
`src/story/` — the end beat of Level 3 will offer it automatically.
