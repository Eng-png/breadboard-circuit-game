# Contributing

Written for a team where not everyone has used git in anger before. Follow it
literally the first few times and it will become muscle memory.

## The one rule

**`main` always runs.** Anyone should be able to pull `main`, run `npm run dev`,
and get a working app. A half-finished feature behind a stub is fine. A merge that
breaks the dev server is not.

## Branching

One branch per piece of work. Name it `<your-initial>/<what-it-does>`:

```
a/series-solver
b/wire-dragging
c/undo-redo
d/led-artwork
```

```bash
git checkout main
git pull                          # always start from current main
git checkout -b b/wire-dragging
# ...work...
git add .
git commit -m "Add rubber-band preview while dragging a wire"
git push -u origin b/wire-dragging
```

Then open a pull request on GitHub.

## Before you open a PR

```bash
npm run lint
npm test
npm run build
```

All three must pass. If you changed something in `src/engine/`, you should have
added or changed a test — the engine is the one place where "I tried it and it
looked right" is not good enough.

## Pull requests

- Keep them small. A PR that touches one folder and under ~300 lines gets reviewed
  in ten minutes. A 2000-line PR gets reviewed in four days, badly.
- Say what it does and how you checked it. Two sentences is plenty.
- Screenshot or short clip for anything visual.
- **Nobody merges their own PR.** Suggested pairs: A reviews C, C reviews A,
  B reviews D, D reviews B. Rotate if that gets stale.
- If a PR touches `src/shared/types.js`, tag all four people. That file is a
  contract and changing it silently will cost somebody a day.

## Reviewing

You are not looking for style nits — the linter handles those. You are looking for:

- Does it stay inside its layer? (Engine importing React, board computing voltages.)
- Would a teammate understand this in three weeks?
- Does the player-facing text explain, rather than scold?

Approve generously. Blocking a teammate for a day over a variable name is worse
than the variable name.

## Commit messages

Present tense, says what changed:

```
Add short-circuit detection to the solver
Fix wire snapping near the board edge
Rewrite LED blurb for beginners
```

Not `fix`, `stuff`, `wip`, or `asdf`.

## When you are stuck

Say so in the group chat within an hour. Everybody on this project is learning
something, and the whole schedule assumes you ask early. Being stuck quietly for
two days is the only real failure mode.
