/**
 * OWNER: Person D (copy + art) / Person C (layout)
 *
 * The mouse from the title screen, teaching the board. It appears three
 * times, and it stands somewhere different each time so they are not mistaken
 * for one another:
 *
 *   'placing'  before the player has dragged anything. The mouse stands to
 *              the left of the toolbox with the text above its head, pointing
 *              down at it. It leaves as soon as they drag a part.
 *   'placed'   once a wire is on the board. The mouse climbs on top of the
 *              toolbox and the text sits to the left of the box, pointing
 *              across at it.
 *   'board'    once the battery is across the power rails. This one is about
 *              the board, so it is shown ON the board: the mouse at its
 *              left-hand edge and the text laid across its bottom half.
 *
 * No animation and nothing to click in any of them.
 *
 * The first two mount in the sidebar beside the toolbox and the third mounts
 * inside the board — PuzzlePanel decides which, because only it knows where
 * those two places are.
 *
 * THE COPY IS A PLACEHOLDER and it lives in content/tutorial.js, not here.
 * Rewrite it there and nothing in this file has to change.
 */

import { MOUSE_SPRITE } from '../menu/MainMenu.jsx';
import { useImageAvailable } from '../breadboard/useImageAvailable.js';
import './TutorialMouse.css';

/**
 * @param {object} props
 * @param {'placing'|'placed'|'board'|null} props.stage  Which one, or null —
 *                                               between them the mouse is off
 *                                               screen entirely.
 * @param {string[]} props.lines  What it says this time round.
 */
export function TutorialMouse({ stage, lines = [] }) {
  const hasMouse = useImageAvailable(MOUSE_SPRITE) === true;
  if (!stage || lines.length === 0) return null;

  const box = (
    <aside className={`tutor__box tutor__box--${stage}`} aria-label="How to play">
      {lines.map((line) => (
        <p className="tutor__line" key={line}>
          {line}
        </p>
      ))}
    </aside>
  );

  const mouse = hasMouse ? (
    <img className="tutor__mouse" src={MOUSE_SPRITE} alt="" aria-hidden="true" />
  ) : null;

  /*
   * Beside the toolbox: one column of its own, so the box stacks above the
   * mouse and the whole thing is a single item in the sidebar row.
   */
  if (stage === 'placing') {
    return (
      <div className="tutor tutor--beside">
        {box}
        {mouse}
      </div>
    );
  }

  /*
   * Across the board: one absolutely positioned layer over it, with the mouse
   * at the left-hand edge and the text filling the bottom half beside it.
   */
  if (stage === 'board') {
    return (
      <div className="tutor tutor--board">
        {box}
        {mouse}
      </div>
    );
  }

  /*
   * On top of the toolbox: two separate pieces. The box is an ordinary item
   * in the sidebar row and lands left of the toolbox on its own; the mouse is
   * lifted out of the flow and parked over it, because perching on something
   * means overlapping it and flow layout cannot overlap.
   */
  return (
    <>
      {box}
      {mouse && (
        <div className="tutor__perch" aria-hidden="true">
          {mouse}
        </div>
      )}
    </>
  );
}
