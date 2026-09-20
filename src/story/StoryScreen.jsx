/**
 * OWNER: Person C (Game Shell & Story)
 *
 * The director. This is the one file that knows about both the story and the
 * circuit, and it is where they meet:
 *
 *   circuit result  ->  how bright the room is
 *   circuit solved  ->  the story is allowed to move on
 *
 * Everything else stays ignorant of the other half. The engine has never heard
 * of a living room; the story has never heard of Ohm's law.
 */

import { useRef } from 'react';
import { ArduinoDock } from '../game/ArduinoDock.jsx';
import { useGameState } from '../game/useGameState.js';
import { PuzzlePanel } from '../game/PuzzlePanel.jsx';
import { DialogueBox } from './DialogueBox.jsx';
import { FanProp } from './FanProp.jsx';
import { LimitSwitches } from './LimitSwitches.jsx';
import { Scene } from './Scene.jsx';
import { useLimitSwitches } from './useLimitSwitches.js';
import { useStory } from './useStory.js';
import './story.css';

/** How dark "dark" is. Not zero — the player still needs to see the furniture. */
const DARK = 0.07;

/**
 * @param {object} props
 * @param {import('../shared/types.js').Level} props.level
 * @param {{ id: string, title: string, chapter?: string, props?: string[], beats: any[] }} props.story
 *   `props` names the room furniture this story uses: 'fan' puts the desk fan
 *   in the room (a narrative beat's `fanSpeed`, 0..1, runs it; a puzzle beat
 *   runs it from the fan motor on the board), 'limit-switches' adds the two
 *   limit switches and the Arduino above the board. A beat's `limits`
 *   ({ left, right }) says which ends already have a switch, for beats that
 *   show the finished rig.
 * @param {{ label: string, onSelect: () => void } | null} [props.nextLevel]
 *   Offered on the story's end beat. Null on the last level.
 * @param {import('react').ReactNode} [props.levelNav]  Level picker shown in the header.
 */
export function StoryScreen({ level, story, nextLevel = null, levelNav = null }) {
  const { beat, visibleLines, hasMoreLines, advance, restart } = useStory(story);
  const game = useGameState(level);
  const { context } = game;
  const sceneRef = useRef(null);
  const fanRef = useRef(null);
  const rig = useLimitSwitches(sceneRef, fanRef);

  const isPuzzle = beat.mode === 'puzzle';

  /*
   * The room follows the LED *right now* — not whether the puzzle is solved.
   * Those are different questions, and conflating them costs the level its
   * point: with a correct circuit and the switch flipped off, the room must go
   * dark again. That is the whole lesson about what a switch is.
   *
   * An LED with nothing limiting its current is not dark — it is far too
   * bright, right up until it dies. So an over-driven LED lights the room too,
   * with a glare on top. Level 2 is built on that difference.
   *
   * A lit LED is only as bright as the current through it, so the room follows
   * that too. Level 3's dimmer is built on that.
   */
  const parts = Object.values(context.result.components);
  const roomLit = parts.some((part) => part.lit === true);
  const roomGlare = parts.some((part) => part.burnedOut === true);
  const brightness = parts.reduce(
    (max, part) => (part.lit === true ? Math.max(max, part.brightness ?? 1) : max),
    0,
  );

  /*
   * The fan follows the fan motor on the board the same way. Level 4 has no
   * LED, so its puzzle beat sets `light` itself; the fan is the thing that
   * shows the circuit is alive there.
   */
  const fanSpeed = parts.reduce(
    (max, part) => (part.spinning === true ? Math.max(max, part.speed ?? 1) : max),
    0,
  );

  const hasFan = story.props?.includes('fan') === true;
  const hasRig = story.props?.includes('limit-switches') === true;

  // You may move on once the circuit is right AND you can see it working: the
  // light is on — or, with the fan rig, the fan turns and both ends are guarded.
  const rigDone = hasRig ? fanSpeed > 0 && rig.limits.left && rig.limits.right : false;
  const canContinue = game.won && (roomLit || rigDone);

  const liveLight = roomGlare ? 1 : roomLit ? DARK + (1 - DARK) * brightness : DARK;
  const light = isPuzzle ? (beat.light ?? liveLight) : (beat.light ?? 1);
  const glare = isPuzzle ? (roomGlare ? 1 : 0) : (beat.glare ?? 0);

  const limits = isPuzzle ? rig.limits : (beat.limits ?? rig.limits);
  const dock = hasRig && isPuzzle ? <ArduinoDock limits={limits} hit={rig.hit} /> : null;

  return (
    <Scene key={beat.background} name={beat.background} light={light} glare={glare} ref={sceneRef}>
      {hasFan && (
        <FanProp
          ref={fanRef}
          speed={isPuzzle ? fanSpeed : (beat.fanSpeed ?? 0)}
          limits={limits}
          onHit={rig.onHit}
        />
      )}
      {hasRig && isPuzzle && (
        <LimitSwitches
          switches={rig.switches}
          dragging={rig.dragging}
          onGrab={rig.beginDrag}
          onPlace={rig.placeAt}
          hit={rig.hit}
        />
      )}
      <div className="story" data-mode={beat.mode}>
        <header className="story__header">
          <div>
            <span className="story__chapter">{story.chapter ?? level.title}</span>
            <h1>{story.title}</h1>
          </div>
          {levelNav}
        </header>

        {isPuzzle ? (
          <>
            <DialogueBox lines={visibleLines} dimmed />
            <PuzzlePanel level={level} game={game} dock={dock} />
            {canContinue && (
              <div className="story__resolve">
                <p>{beat.resolve ?? 'The circuit works.'}</p>
                <button type="button" onClick={advance}>
                  {beat.resolveLabel ?? 'Continue'}
                </button>
              </div>
            )}
          </>
        ) : (
          <DialogueBox
            lines={visibleLines}
            hasMoreLines={hasMoreLines}
            advanceLabel={beat.advance}
            onAdvance={beat.advance || hasMoreLines ? advance : undefined}
          />
        )}

        {beat.mode === 'end' && (
          <div className="story__end">
            <p className="story__end-label">End of {story.chapter ?? level.title}</p>
            <p className="story__end-note">
              {nextLevel
                ? 'The story continues in the next level.'
                : 'That is every level there is — for now.'}
            </p>
            <div className="story__end-actions">
              {nextLevel && (
                <button type="button" onClick={nextLevel.onSelect}>
                  {nextLevel.label}
                </button>
              )}
              <button type="button" className="button--ghost" onClick={restart}>
                Play {story.chapter ?? level.title} again
              </button>
            </div>
          </div>
        )}
      </div>
    </Scene>
  );
}
