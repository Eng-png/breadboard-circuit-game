# Breadboard

A browser game that teaches the very basics of electronics by having you build
real circuits on a realistic breadboard.

**Level 1 — "Light It Up":** wire a battery, a switch, a resistor and an LED
into a single loop, then flip the switch and watch the light obey you. The win
condition is two-sided on purpose — the LED must be *dark* with the switch open
and *lit* with it closed — because that is the actual idea being taught.

The board behaves like a physical breadboard, not like a wiring diagram. Holes
in the same five-hole strip are already joined by copper inside the board. The
channel down the middle really does split every column in two. Plug an LED in
backwards and it stays dark. Skip the resistor and you burn it out. Those
frustrations are the lesson.

## Quick start

```bash
git clone https://github.com/<org-or-user>/breadboard-circuit-game.git
cd breadboard-circuit-game
npm install
npm run dev
```

Then open the URL it prints (usually <http://localhost:5173>).

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Re-run tests as you edit |
| `npm run lint` | Static checks |
| `npm run build` | Production build into `dist/` |

## Stack

React 19 + Vite, plain JavaScript with JSDoc types (no TypeScript compile step),
SVG for the board, Vitest for tests. No physics library and no circuit-simulation
dependency — the solver is ours, because writing it *is* part of the project.

## Layout

```
src/
  shared/      Types and hole-id helpers. The vocabulary everyone speaks.
  engine/      Pure circuit solver. No React, no DOM, no pixels.
  breadboard/  SVG board, geometry, drag/drop and wire drawing.
  game/        Game state, level runner, screen layout.
  ui/          Tray, objectives, hints.
  content/     Component catalog, level definitions, theme, copy.
docs/
  ARCHITECTURE.md   How the pieces fit and what each contract guarantees.
TEAM_PLAN.md        Who builds what, in what order.
CONTRIBUTING.md     Branching, PRs, and how to not step on each other.
```

## For the team

Read [TEAM_PLAN.md](TEAM_PLAN.md) first, then
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), then the file you own.
