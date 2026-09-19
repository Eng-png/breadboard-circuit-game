/**
 * OWNER: Person D (copy) / Person C (behaviour)
 *
 * Narration. Click (or press space) to reveal the next line, then to move on.
 */

export function DialogueBox({ lines, hasMoreLines, advanceLabel, onAdvance, dimmed = false }) {
  if (lines.length === 0) return null;

  return (
    <div className="dialogue" data-dimmed={dimmed}>
      <div className="dialogue__lines">
        {lines.map((line, index) => (
          <p key={line} className="dialogue__line" data-latest={index === lines.length - 1}>
            {line}
          </p>
        ))}
      </div>

      {onAdvance && (
        <button type="button" className="dialogue__advance" onClick={onAdvance}>
          {hasMoreLines ? 'Continue' : advanceLabel}
          <span className="dialogue__key" aria-hidden="true">space</span>
        </button>
      )}
    </div>
  );
}
