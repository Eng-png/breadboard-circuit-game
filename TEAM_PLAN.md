# Team plan — four people, one breadboard game

Read this before you write any code. It takes about ten minutes and it will save
you a week of merge conflicts.

## The split at a glance

| | Role | Owns these folders | Ships |
| --- | --- | --- | --- |
| **A** | Circuit Engine | `src/engine/`, `src/shared/` | The solver that decides whether the LED lights |
| **B** | Breadboard & Interaction | `src/breadboard/` | The board you can actually plug things into |
| **C** | Game Shell, State & Levels | `src/game/`, `src/ui/` | State, rules, objectives, the screen it all lives on |
| **D** | Content, Art & Accessibility | `src/content/`, `src/components/library/`, `src/index.css` | The parts, the art, the words, the polish |

Nobody's folder overlaps with anybody else's. That is not a coincidence — it is
the whole reason the split is shaped this way.

## Why this split and not a different one

The obvious split — "you do the front end, you do the back end, you do the art,
you do the docs" — fails here, because there is no back end and the art *is* the
front end. Three people would end up idle waiting for one.

So we split by **layer of the data flow** instead. Each layer has a written
contract with the next (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)), and
each layer is independently testable:

- A can test the solver with zero UI, by feeding it arrays of placements.
- B can build the board with a fake solver that always says "lit".
- C can build the shell with a fake board that is a grey rectangle.
- D can write parts and copy that all three read as data.

That means on day two, four people are writing code at once and none of them is
blocked. It only works if the contracts are agreed **first** — which is what day
one is for.

## Day 1 — everyone, together, in the same room

Do not split up yet. Two to three hours as a group.

1. Everyone clones, runs `npm install`, `npm run dev`, `npm test`. Nobody leaves
   until all four have a working dev server. Sort out Node versions now, not later.
2. Read `docs/ARCHITECTURE.md` out loud. Seriously — out loud, together.
3. Read `src/shared/types.js` line by line. **Argue about it now.** Every change to
   that file after today costs four people time instead of one.
4. Each person opens a real breadboard (or a photo of one) and finds: the five-hole
   strips, the center channel, the power rails. Everyone needs the physical
   intuition, not just Person B.
5. Agree the answers to these, and write them in the repo:
   - Are we shipping level 1 only, or level 1 plus a stretch level?
   - What is the deadline, and what is the demo?
   - Who reviews whose PRs? (Suggested: A with C, B with D. Nobody merges their own.)
6. Everyone makes one trivial PR — fix a typo, add your name below — and gets it
   reviewed and merged. Learn the git workflow on something that cannot break.

**Team roster** (fill this in on day 1):

| Role | Name | GitHub handle |
| --- | --- | --- |
| A — Engine | | |
| B — Breadboard | | |
| C — Game shell | | |
| D — Content | | |

---

## Person A — Circuit Engine

**You own:** `src/engine/`, `src/shared/`
**You never touch:** anything with `.jsx` in the name.

You are writing the part that decides what is true. Everyone else is writing the
part that shows it. Your code imports React zero times.

`src/engine/netlist.js` is **already finished and tested** — read it first. It is
your reference for the house style, and it solves the hardest structural piece
(union-find over the board's internal copper) so you can start on the interesting
part.

### M1 — Netlist confidence (day 2–3)

- Read `netlist.js` until you could re-derive it.
- Add tests for the cases it does not cover yet: a wire from a rail into a column,
  a wire that loops back to its own strip, a component with a pin in a hole that
  does not exist.
- Write `src/engine/graph.js`: turn placements into a graph where **nodes are nets**
  and **edges are components**. This is the step everything else stands on.

### M2 — The solver (day 4–8)

- `simulate()` in `src/engine/simulate.js`. Series circuits only, `I = V / R_total`
  around a single loop. Do **not** build general nodal analysis; it is out of scope
  and it will eat your whole schedule.
- Handle in this order: battery found, path exists, switch state, short detection,
  Ohm's law, LED polarity, LED current thresholds.
- Implement the `switches: 'forceOpen' | 'forceClosed'` option. Person C's win
  condition literally cannot work without it, so do not leave it for last.

### M3 — Faults that teach (day 9–11)

- Populate `faults[]`. Every fault needs a `message` written for a fourteen-year-old
  who has never seen a circuit.
  - Bad: "OPEN_CIRCUIT at net 12"
  - Good: "There is a gap in your loop. Electricity has to get all the way back to
    the battery's − side, and right now it cannot."
- Write these with Person D. The wording is content, and D owns content.
- Detect `PINS_SAME_NET` — both legs of a component in the same strip, which is the
  single most common beginner mistake and currently produces a silently dead circuit.

**Done when:** `npm test` covers every fault code and every branch of `simulate`,
and Person C can call it and get a correct answer for a hand-built level-1 circuit.

**Your risk:** scope creep into a real SPICE simulator. Resist it. If you finish M3
early, write more tests, not more physics.

---

## Person B — Breadboard & Interaction

**You own:** `src/breadboard/`
**You never touch:** `src/engine/` (you may *read* it, never import `geometry.js`
into it).

You are building the thing people touch. If plugging in a wire does not feel good,
nothing else in the project matters.

`src/breadboard/geometry.js` is **already finished** — the pixel-to-hole mapping in
both directions, using real 2.54 mm hole spacing. `Breadboard.jsx` renders the holes
and nothing else. That is your starting point.

### M1 — The board reads as a board (day 2–4)

- Power rail stripes (red `+`, blue `−`) running the full width.
- Row letters A–J down the side, column numbers 1, 5, 10, 15, 20, 25, 30 along the top.
- The center channel visibly recessed.
- **Hover a hole and highlight every other hole in the same strip.** This one feature
  teaches more about breadboards than any amount of text. Do it early.

### M2 — Wires (day 5–8)

- Click a hole, drag, release on another hole, emit a wire placement upward.
- A live rubber-band line while dragging. Snap to the nearest hole via `holeAt()`;
  if it returns `null`, show the drop as invalid rather than snapping somewhere random.
- Escape cancels. Right-click or click-with-delete-mode removes a placement.
- Wires drawn as curves that sag slightly, not straight lines. Real jumper wires arc,
  and the arc makes overlapping wires readable.

### M3 — Components on the board (day 9–12)

- Drag a part from Person C's tray onto the board.
- A two-pin part needs **two** holes. Decide the interaction and write it down: drop
  one leg, then place the other. Refuse a drop that would put both legs in the same
  strip, and say why.
- Render from Person D's SVG art in `src/components/library/`.
- Render simulation feedback: a lit LED glows, an energized wire tints, a faulted
  component outlines in red. Read these from `CircuitResult` — never compute them.

**Done when:** a person who has never seen the app can build a loop with a mouse and
never has to guess whether something is plugged in.

**Your risk:** you are blocked on D's art for M3. Work with placeholder rectangles
from day one and swap them in at the end. Agree the SVG viewBox convention with D in
week 1 so the swap is a one-line change.

---

## Person C — Game Shell, State & Levels

**You own:** `src/game/`, `src/ui/`, `src/App.jsx`
**You never touch:** `src/engine/` internals, `src/breadboard/` internals.

You are the integrator. Your job is that the other three people's work adds up to a
game instead of three demos. You will do the most merging and the most PR review —
budget for it.

### M1 — State that cannot get corrupted (day 2–5)

- Finish the reducer in `src/game/useGameState.js`: `place`, `remove`, `toggleSwitch`,
  `undo`, `reset`.
- Enforce tray limits. Level 1 gives one battery; the second one must be refused.
- Every action pushes a snapshot onto `history`, so undo is one line.
- Unit-test the reducer with Vitest. It is pure, so this is easy, and it is the file
  most likely to break when other people's features land.

### M2 — The loop closes (day 6–9)

- Recompute `simulateAll()` on every state change (memoised) and render the objective
  checklist from it.
- Fault coaching strip: show `context.result.faults[0].message` prominently. One fault
  at a time — four red messages at once teaches nothing.
- Win detection, fired exactly once, with the `realWorld` payoff panel.
- Hint reveal, one at a time, never automatic.

### M3 — Integration week (day 10–14)

- This is your real job. Wire B's board events into your reducer. Wire A's results
  into your objectives. Chase down the mismatches — there will be mismatches.
- Run the whole thing in front of someone outside the team and watch where they get
  stuck. Fix that, not the thing you thought was broken.
- Level select screen if a second level exists; skip it if not.

**Done when:** you can complete level 1 end to end, undo your way back out, reset, and
do it again, without a console error.

**Your risk:** you are the dependency bottleneck in week 3. Mitigate it by keeping
stubs working — never merge a change that leaves `main` unable to `npm run dev`.

---

## Person D — Content, Art & Accessibility

**You own:** `src/content/`, `src/components/library/`, `src/index.css`, all
player-facing words.
**You never touch:** engine logic or drag-and-drop logic.

This is not the "easy" role. The game is a teaching tool, and you own the teaching. A
technically perfect simulator that explains nothing is a failure.

`src/content/components.js` and `src/content/levels/level1.js` are **already written
as working drafts** — real numbers, real hints, a real payoff note. Your first job is
to decide whether they are good, not to start from nothing.

### M1 — The parts look like parts (day 2–6)

- SVG art in `src/components/library/`: jumper wire, 9 V battery, LED (with a visibly
  longer anode leg and a flat side on the cathode), 330 Ω resistor with correct colour
  bands, push switch.
- Agree a shared viewBox and pin-anchor convention with Person B **in week 1**, so the
  art drops into the board without re-layout.
- The LED needs two states: dark and glowing. The glow should be obvious at a glance.

### M2 — The words do the teaching (day 7–10)

- Rewrite every string in `components.js` and `level1.js` for a total beginner. Test
  them on someone who does not do electronics. If they ask "what is an anode", the
  copy is not done.
- Write the fault messages **with Person A**. Each one should say what happened, why,
  and what to try — in that order, in two sentences.
- A short "what is a breadboard" intro overlay: the strips, the channel, the rails.
  Three panels, no more.

### M3 — Polish and access (day 11–14)

- Check every colour pair in `index.css` against WCAG AA (4.5:1 for body text).
- **Do not rely on colour alone.** A lit LED must also change shape or size; a fault
  must also carry text. Roughly one in twelve men has some red-green colour deficiency,
  and this is a game about red and blue wires.
- Dark mode via `prefers-color-scheme`.
- Respect `prefers-reduced-motion` for the glow and wire animations.
- Responsive down to a tablet. A breadboard on a phone is not worth the fight — show a
  "please use a bigger screen" note instead.

**Done when:** someone who has never touched electronics can play level 1 and then
correctly explain to you why the switch turns the light off.

**Your risk:** art expands to fill all available time. Timebox each part to half a day.
A clean, readable, slightly plain LED beats a photorealistic one that arrives in week
four.

---

## Timeline and integration checkpoints

A four-week shape. Compress or stretch it, but keep the checkpoints.

| Week | A (Engine) | B (Board) | C (Shell) | D (Content) |
| --- | --- | --- | --- | --- |
| 1 | M1 netlist + graph | M1 board reads as a board | M1 reducer | M1 part art |
| 2 | M2 solver | M2 wires | M2 objectives + faults | M2 copy |
| 3 | M3 faults | M3 components on board | M3 **integration** | M3 polish |
| 4 | Tests, bug fixes, support C | Feel and feedback polish | Playtesting fixes | Access + intro overlay |

**Checkpoint 1 — end of week 1. Everyone demos for five minutes.**
A shows a netlist test passing. B shows the board with strip highlighting. C shows the
reducer under test. D shows the parts on paper or screen. Nothing is integrated yet and
that is fine.

**Checkpoint 2 — end of week 2. The contract test.**
C writes a level-1 circuit as a hardcoded array of placements and calls A's
`simulate()`. It must return `lit: true`. Separately, B's board must be able to produce
that exact array through mouse interaction. If both are true, the halves will meet.
**If this checkpoint slips, everything after it slips** — treat it as the real deadline.

**Checkpoint 3 — end of week 3. Playable start to finish, ugly is fine.**

**Checkpoint 4 — end of week 4. Ship.**

## Keeping out of each other's way

The folder split means you should almost never conflict. The exceptions, and what to do
about them:

| Shared file | Rule |
| --- | --- |
| `src/shared/types.js` | Changes need a PR tagged to all four. Never edit on a feature branch and hope. |
| `package.json` | Announce new dependencies before installing. Someone has to re-run `npm install`. |
| `src/content/levels/level1.js` | D owns the strings, C owns the `check` functions. Edit only your half. |
| `src/index.css` | D owns it. Everyone else adds tokens by asking D, not by editing. |

Everything else: if it is not in your folder, open a PR instead of editing it.

## Definition of done — Level 1

The level ships when **all** of these are true:

- [ ] The board shows strips, rails, and the channel, and hovering a hole reveals its strip.
- [ ] The player can drag out a battery, switch, resistor and LED, and run wires between holes.
- [ ] Two legs of one component in the same strip is refused, with an explanation.
- [ ] An LED plugged in backwards stays dark and says why.
- [ ] No resistor in the loop burns the LED out, visibly, and says why.
- [ ] With a correct loop: switch open means dark, switch closed means lit.
- [ ] All four objectives tick off, and the win panel shows the real-world note.
- [ ] Undo and reset work from any state.
- [ ] Five hints, revealed one at a time, never automatically.
- [ ] `npm test`, `npm run lint` and `npm run build` all pass on `main`.
- [ ] One person outside the team completed it without help, and can explain why the switch works.

That last checkbox is the actual goal. The other ten are how you get there.

## If something slips

The plan degrades in this order. Cut from the bottom.

1. **Cut the second level.** Already out of scope; keep it that way.
2. **Cut drag-and-drop for components.** Fall back to: click a tray part, then click two
   holes. Less satisfying, far less code, and it teaches the same thing.
3. **Cut the resistor requirement.** Drop the burnout objective; keep battery, switch,
   LED. Level 1 still teaches the loop and the switch.
4. **Cut custom art.** Coloured rectangles with text labels. Ugly, playable.
5. **Never cut:** the strip-highlighting on hover, the two-sided switch win condition,
   and the fault messages. Those three *are* the teaching.

## If you finish early

- A second level: two LEDs in parallel, and the nodal-analysis solver it needs.
- A free-play sandbox with no objectives.
- Save and share a circuit via a URL — `placements` is already JSON-serialisable.
- A multimeter tool: click two holes, see the voltage between them.
