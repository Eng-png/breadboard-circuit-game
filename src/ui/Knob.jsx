/**
 * OWNER: Person C (behaviour) / Person D (art + copy)
 *
 * The knob for one potentiometer on the board. A plain range input: it works
 * with a mouse, a finger, and the arrow keys, and screen readers already know
 * what it is.
 */

import { getComponent } from '../content/components.js';

/**
 * @param {object} props
 * @param {import('../shared/types.js').Placement} props.placement
 * @param {import('../shared/types.js').PlacementResult} [props.result]
 * @param {(turn: number) => void} props.onTurn
 */
export function Knob({ placement, result, onTurn }) {
  const def = getComponent(placement.type);
  const turn = placement.state?.turn ?? 0;
  const ohms = result?.ohms ?? 0;
  const inputId = `knob-${placement.id}`;

  return (
    <div className="knob" data-placement={placement.id}>
      <label className="knob__label" htmlFor={inputId}>
        <span>{def.label} knob</span>
        <span className="knob__reading">{Math.round(ohms)} Ω</span>
      </label>
      <div className="knob__row">
        <span className="knob__end">Bright</span>
        <input
          id={inputId}
          className="knob__input"
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(turn * 100)}
          onChange={(event) => onTurn(Number(event.target.value) / 100)}
          aria-valuetext={`${Math.round(ohms)} ohms`}
        />
        <span className="knob__end">Dim</span>
      </div>
    </div>
  );
}
