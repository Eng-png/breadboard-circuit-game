/**
 * OWNER: Person B (Breadboard & Interaction)  — STUB, renders holes only.
 *
 * Draws the board and reports hole clicks upward. It knows nothing about game
 * rules and nothing about electricity: it turns pixels into hole ids, and hole
 * ids into pixels. Keep it that way.
 *
 * TODO(Person B):
 *   - Colour a hole while hovered, and highlight every other hole in the same
 *     strip. Seeing the strip light up is how the player learns the board.
 *   - Wire tool: click hole -> drag -> release on another hole -> onPlace a wire.
 *   - Render placed components from `placements` using the art in
 *     src/components/library/ (Person D).
 *   - Drag a component from the tray onto the board; snap to the nearest hole
 *     via holeAt(); refuse the drop and shake if holeAt() returns null.
 *   - Escape cancels an in-progress wire. Right-click a placement to remove it.
 *   - Keyboard access: holes are focusable, Enter starts/ends a wire.
 */

import { BOTTOM_ROWS, COLUMNS, RAILS, TOP_ROWS, hole, railHole } from '../shared/holes.js';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  PITCH,
  channelBand,
  holeCenter,
} from './geometry.js';
import './Breadboard.css';

const ALL_ROWS = [...TOP_ROWS, ...BOTTOM_ROWS];

/**
 * @param {object} props
 * @param {import('../shared/types.js').Placement[]} props.placements
 * @param {(hole: import('../shared/types.js').HoleId) => void} [props.onHoleClick]
 */
export function Breadboard({ placements = [], onHoleClick }) {
  const channel = channelBand();

  return (
    <svg
      className="breadboard"
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      role="group"
      aria-label="Breadboard"
    >
      <rect className="breadboard__body" width={BOARD_WIDTH} height={BOARD_HEIGHT} rx="2" />
      <rect
        className="breadboard__channel"
        x="0"
        y={channel.y}
        width={BOARD_WIDTH}
        height={channel.height}
      />

      {RAILS.map((rail) =>
        Array.from({ length: COLUMNS }, (_, i) => {
          const id = railHole(rail, i + 1);
          return <Hole key={id} id={id} onClick={onHoleClick} />;
        }),
      )}

      {ALL_ROWS.map((row) =>
        Array.from({ length: COLUMNS }, (_, i) => {
          const id = hole(row, i + 1);
          return <Hole key={id} id={id} onClick={onHoleClick} />;
        }),
      )}

      {/* TODO(Person B): render `placements` on top of the holes. */}
      {placements.length > 0 && null}
    </svg>
  );
}

function Hole({ id, onClick }) {
  const center = holeCenter(id);
  if (!center) return null;
  return (
    <circle
      className="breadboard__hole"
      cx={center.x}
      cy={center.y}
      r={PITCH * 0.28}
      onClick={onClick ? () => onClick(id) : undefined}
    >
      <title>{id}</title>
    </circle>
  );
}
