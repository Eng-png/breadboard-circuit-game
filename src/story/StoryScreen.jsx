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

import { useGameState } from '../game/useGameState.js';
import { PuzzlePanel } from '../game/PuzzlePanel.jsx';
import { DialogueBox } from './DialogueBox.jsx';
import { Scene } from './Scene.jsx';
import { useStory } from './useStory.js';
import './story.css';

/** How dark "dark" is. Not zero — the player still needs to see the furniture. */
const DARK = 0.07;

/**
 * @param {object} props
 * @param {import('../shared/types.js').Level} props.level
 * @param {{ id: string, title: string, beats: any[] }} props.story
 */
export function StoryScreen({ level, story }) {
  const { beat, visibleLines, hasMoreLines, advance, restart } = useStory(story);
  const game = useGameState(level);
  const { context } = game;

  const isPuzzle = beat.mode === 'puzzle';

  /*
   * The room follows the LED *right now* — not whether the puzzle is solved.
   * Those are different questions, and conflating them costs the level its
   * point: with a correct circuit and the switch flipped off, the room must go
   * dark again. That is the whole lesson about what a switch is.
   */
  const roomLit = Object.values(context.result.components).some((part) => part.lit === true);

  // You may move on once the circuit is right AND the light is actually on.
  const canContinue = game.won && roomLit;

  const light = isPuzzle ? (roomLit ? 1 : DARK) : (beat.light ?? 1);

  return (
    <Scene key={beat.background} name={beat.background} light={light}>
      <div className="story" data-mode={beat.mode}>
        <header className="story__header">
          <span className="story__chapter">Level 1</span>
          <h1>{story.title}</h1>
        </header>

        {isPuzzle ? (
          <>
            <DialogueBox lines={visibleLines} dimmed />
            <PuzzlePanel level={level} game={game} />
            {canContinue && (
              <div className="story__resolve">
                <p>The bulb catches. Light spills out of the panel and across the floor.</p>
                <button type="button" onClick={advance}>
                  Stand up and look around
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
            <p className="story__end-label">End of Level 1</p>
            <p className="story__end-note">
              Level 2 picks up from here — it is not built yet.
            </p>
            <button type="button" className="button--ghost" onClick={restart}>
              Play Level 1 again
            </button>
          </div>
        )}
      </div>
    </Scene>
  );
}
