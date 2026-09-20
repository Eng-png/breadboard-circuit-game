# 24-hour sprint plan — Level 1

**The good news: Level 1 already works end to end.** Engine, breadboard, story,
and win condition are built and covered by 35 passing tests. You can play it
right now with `npm run dev`.

What is left is the part that makes it *yours*: the art, the writing, the feel,
and getting it onto a URL someone can open. That is what these 24 hours are for.

> **Level 2 is out of scope.** The story ends on a hook for it (the room is too
> bright). Do not start it. Finishing Level 1 properly beats two half-levels.

## What already exists

| Piece | State |
| --- | --- |
| Circuit solver | Done. Series solver, LED polarity, burnout, shorts, teaching fault messages. 27 tests. |
| Breadboard | Done. Real 2.54 mm pitch, strip-highlight on hover, drag-and-drop placement, undo/reset. |
| Story engine | Done. Data-driven beats, line-by-line reveal, dark→lit room driven live by the circuit. |
| Level 1 | Done. Battery + switch + resistor + LED. Win = dark with switch open, lit with it closed. |
| Playthrough test | Done. 21 tests that play the level like a human. |
| Art | **Placeholders.** Every asset slot exists with a fallback. Toolbox tray art is in; component PNGs still to come. |
| Deploy | **Not done.** |

Run `npm run dev` before you read any further. Ten minutes of playing it is
worth more than ten minutes of this document.

## The split

Four people, four lanes that do not touch the same files.

| | Lane | Owns | The one thing that matters |
| --- | --- | --- | --- |
| **A** | Art & assets | `public/assets/`, `src/breadboard/boardSkin.js` | The room, and the cut from dark to lit |
| **B** | Story & copy | `src/story/level1Story.js`, `src/content/` | It has to read like a story, not a worksheet |
| **C** | Integration, deploy & QA | CI, Pages, bug triage | A URL that works, and no broken `main` |
| **D** | Feel & accessibility | `src/index.css`, `story.css`, audio | The moment the light comes on should feel good |

## Hour by hour

Times are "hours remaining". Adjust to your actual deadline.

### T-24 → T-22: everyone together

1. All four: clone, `npm install`, `npm run dev`, **play Level 1 to the end.**
2. All four: `npm test` passes for everyone before anyone writes code.
3. Decide as a group:
   - Which of your existing room assets map to `living-room-dark` and `living-room-lit`? They must be the **same camera angle** — the cut between them is the payoff.
   - Is the deadline a demo, a submission, or both?
4. Person C creates four GitHub issues, one per lane, and assigns them.

### T-22 → T-14: parallel build

**Person A — Art & assets**
- Drop backgrounds into `public/assets/backgrounds/` with the exact names in `public/assets/README.md`. The game picks them up on refresh; no code change.
- Breadboard image: drop it in, load `?calibrate=1`, drag the four sliders until the hole dots sit in the image's holes, paste the numbers into `boardSkin.js`. **Budget 30 minutes, not 3 hours.** If the image fights you, ship the drawn SVG board — it already looks fine.
- Component art last. There is working SVG art for every part; only replace it if yours is clearly better.

**Person B — Story & copy**
- `src/story/level1Story.js` is the whole script. Rewrite every line in your voice. Adding or reordering beats needs no code changes.
- Then the teaching copy: `src/content/components.js` blurbs, `level1.js` hints, and the fault messages in `src/engine/simulate.js`. Those fault messages are what a stuck player actually reads — they matter more than the narration.
- Test your writing on someone who does not do electronics. If they ask "what is an anode", it is not done.

**Person C — Integration, deploy & QA**
- **Get GitHub Pages live in the first hour.** Deploying at T-2 is how projects die. See below.
- Then: review and merge everyone's PRs, keep `main` green, run the playthrough test after every merge.
- Keep a running bug list. Do not fix things silently — triage them so people are not surprised.

**Person D — Feel & accessibility**
- The dark→lit transition in `story.css` (`.scene__veil`, `.scene__glow`). Make the light coming on feel like relief.
- Audio: a click for the switch, a hum or thunk when the light comes on, quiet room ambience. One `<audio>` per sound is enough; do not add a library.
- Contrast check every colour in `index.css`. The UI is dark glass over a dark room — that is exactly where text goes unreadable.
- Check it on a laptop screen at 100% zoom, not just your monitor.

### T-14 → T-8: integrate

- Everyone merges to `main`. Person C owns the order.
- **Full playthrough by all four, separately.** Write down every moment you hesitated. Those are the bugs.
- Fix the top three confusions. Ignore the rest.

### T-8 → T-4: outsiders play it

- Find two people who are not on the team. Watch them play. **Do not help them.**
- Where they get stuck is where your copy is wrong, not where they are slow.
- Fix only what more than one person tripped on.

### T-4 → T-1: freeze

- Person C: final deploy, verify the live URL on a phone and a laptop.
- No new features. None. Only crash fixes.
- Write the README bit that explains what the project is, in case a grader reads before playing.

### T-1 → T-0: rehearse

- Run the demo out loud, twice, on the machine you will present from.
- Have the live URL open in a tab already. Wifi fails at demos.

## Deploy (Person C, do this first)

```bash
npm i -D gh-pages
```

Add to `package.json`:
```json
"homepage": "https://Mrwhale1111.github.io/breadboard-circuit-game",
"scripts": { "deploy": "npm run build && gh-pages -d dist" }
```

Add to `vite.config.js`: `base: '/breadboard-circuit-game/'`

Then `npm run deploy`, and enable Pages in repo Settings → Pages → branch `gh-pages`.

## Rules for the next 24 hours

1. **`main` always runs.** Test before you push. If you break it, fix it or revert it immediately.
2. **Small PRs.** One lane, one concern. Person C cannot review a 1500-line PR at 3 am.
3. **Stay in your lane's files.** If you need something in someone else's file, ask them. Two people editing `story.css` at hour 20 is how you lose an hour.
4. **Say you are stuck within 20 minutes.** Not two hours. Everyone is learning something here and the schedule assumes you ask.
5. **Do not refactor.** The architecture is what it is until the deadline passes.

## Cut list

If you are behind, cut from the bottom. Decide by T-8, not T-1.

1. Component PNG art — the SVG art is fine
2. Audio
3. Breadboard image — the drawn board works
4. Custom backgrounds — the CSS gradients genuinely look okay
5. **Never cut:** the strip-highlight on hover, the room going dark when you flip the switch off, and the fault messages. Those three *are* the teaching.

## Done means

- [ ] Someone outside the team played it start to finish without help
- [ ] They can explain why the switch turns the light off
- [ ] It is live on a URL that works on a phone
- [ ] `npm test`, `npm run lint`, `npm run build` all pass on `main`
- [ ] The demo has been rehearsed out loud, twice
