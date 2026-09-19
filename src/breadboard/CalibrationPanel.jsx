/**
 * OWNER: Person B
 *
 * Dev-only overlay for lining a breadboard image up with the hole grid.
 * Only appears when the URL contains ?calibrate=1 — players never see it.
 *
 * Drag until the dots sit in the holes, then paste the printed object into
 * DEFAULT_SKIN in boardSkin.js and commit it.
 */

import { DEFAULT_SKIN, clearSkin } from './boardSkin.js';

const FIELDS = [
  { key: 'x', label: 'Left', min: -20, max: 20, step: 0.1 },
  { key: 'y', label: 'Top', min: -20, max: 20, step: 0.1 },
  { key: 'width', label: 'Width', min: 40, max: 140, step: 0.1 },
  { key: 'opacity', label: 'Image opacity', min: 0, max: 1, step: 0.05 },
];

export function CalibrationPanel({ skin, onChange, imageFound }) {
  const snippet = `export const DEFAULT_SKIN = {
  x: ${skin.x},
  y: ${skin.y},
  width: ${skin.width},
  opacity: ${skin.opacity},
};`;

  return (
    <div className="calibrate">
      <h2>Breadboard calibration</h2>

      {!imageFound && (
        <p className="calibrate__warn">
          No image at <code>/assets/breadboard/breadboard.png</code> yet. Drop one in and
          refresh.
        </p>
      )}

      {FIELDS.map((field) => (
        <label key={field.key} className="calibrate__row">
          <span>{field.label}</span>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={skin[field.key]}
            onChange={(event) =>
              onChange({ ...skin, [field.key]: Number(event.target.value) })
            }
          />
          <output>{skin[field.key]}</output>
        </label>
      ))}

      <p className="calibrate__hint">Paste this into src/breadboard/boardSkin.js:</p>
      <pre className="calibrate__snippet">{snippet}</pre>

      <div className="calibrate__actions">
        <button
          type="button"
          className="button--ghost"
          onClick={() => navigator.clipboard?.writeText(snippet)}
        >
          Copy
        </button>
        <button
          type="button"
          className="button--ghost"
          onClick={() => {
            clearSkin();
            onChange(DEFAULT_SKIN);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
