# Architecture

The whole design exists to answer one question: **how do four people build this
at the same time without constantly breaking each other's work?**

The answer is a one-way data flow with narrow, written-down contracts between
four layers. If you only remember one thing, remember this diagram.

```
   Person D                Person B                Person C              Person A
  ┌──────────┐          ┌────────────┐          ┌──────────┐         ┌──────────┐
  │ content/ │  defs    │ breadboard/│ actions  │  game/   │ state   │ engine/  │
  │  levels  │ ───────► │  SVG + DnD │ ───────► │  reducer │ ──────► │ simulate │
  │  catalog │          │            │          │          │         │          │
  └──────────┘          └────────────┘          └──────────┘         └──────────┘
                              ▲                       │                    │
                              │      placements       │   CircuitResult    │
                              └───────────────────────┴────────────────────┘
```

Data flows clockwise. Nothing flows the other way. In particular:

- **The engine never imports React, the DOM, or anything from `breadboard/`.**
  It takes an array of `Placement` and returns a `CircuitResult`. That is all.
  This is why Person A can work before a single pixel is drawn.
- **The breadboard never computes electrical results.** It converts pixels into
  hole ids and hole ids into pixels. It renders whatever `CircuitResult` it is
  handed. This is why Person B can work before the solver exists.
- **The game shell never draws the board and never solves the circuit.** It owns
  state and rules. This is why Person C can work against stubs.
- **Content is data, not code paths.** Adding a component or a level must not
  require editing `engine/` or `breadboard/`.

## The four contracts

### 1. `HoleId` — the shared language

A string. `"A5"`, `"J30"`, `"TP1"`. Defined in [`src/shared/holes.js`](../src/shared/holes.js).

The renderer is the only thing that knows `"A5"` is 12.7 mm from the left edge.
The engine is the only thing that knows `"A5"` and `"E5"` are the same electrical
point. Neither needs to know the other's job, and they meet at this string.

### 2. `Placement` — what the player built

```js
{ id: 'led-1', type: 'led', holes: ['A5', 'A9'], state: {} }
```

`holes[i]` corresponds to `ComponentDef.pins[i]`. So for an LED,
`holes[0]` is the anode and `holes[1]` is the cathode. **Order is load-bearing.**
Getting it backwards is exactly how the game detects a backwards LED, so the
renderer must be careful about which end the player dropped where.

The array of placements is the entire save-state of a level. Serialise it and
you have save/load for free.

### 3. `CircuitResult` — what the electricity did

Returned by `simulate(placements, options)`. Full shape in
[`src/shared/types.js`](../src/shared/types.js). The fields that matter most:

- `complete` — a closed loop exists from battery + back to battery −
- `shorted` — current can get from + to − without passing through a load
- `components[id].lit / .energized / .reverseBiased / .burnedOut`
- `faults[]` — player-facing coaching, not error codes

`simulate` takes `{ switches: 'asPlaced' | 'forceOpen' | 'forceClosed' }`. That
option exists so the game shell can ask *"would this light up if the switch were
closed?"* without mutating anything. Level 1's win condition depends on it.

**Rule: `simulate` always returns a fully-shaped result, even for nonsense
input.** Never `null`, never a thrown error, never a missing field. Three other
people are rendering from it.

### 4. `Level` — the content format

A plain object with `tray`, `objectives`, `hints`, and `realWorld`. Each
objective is `{ id, description, check(ctx) }` where `check` is a **pure**
function of the simulation context. No fetching, no timers, no randomness.

## Scope guard for v1

The solver handles **series circuits only**. `I = V / R_total` around one loop.
That is enough for level 1 and it keeps the engine small enough for one person
to finish. Full nodal analysis (parallel branches, multiple loops) is deferred —
if a later level needs it, that is a new milestone with its own design, not
something to sneak in.

If a player builds something the series solver cannot handle, `simulate` should
report a fault explaining that the circuit is more complicated than this level
expects — not crash, and not lie.

## Why SVG and not canvas

Every hole is a real DOM node. That buys us hit-testing for free, CSS hover
states for free, keyboard focus for free, and screen-reader labels for free.
A half-size breadboard is 30 × 14 = 420 holes plus rails, which is well inside
what the browser handles comfortably. If we ever hit a perf wall, the geometry
is already isolated in one file and could be re-pointed at a canvas.
