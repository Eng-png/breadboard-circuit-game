/**
 * OWNER: Person D (copy) / Person C (reveal logic)  — STUB.
 *
 * Hints reveal one at a time and never auto-show. A player who is stuck should
 * be able to get unstuck; a player who is not should never be spoiled.
 */

/**
 * @param {object} props
 * @param {string[]} props.hints
 * @param {number} props.revealed
 * @param {() => void} props.onReveal
 */
export function HintPanel({ hints, revealed, onReveal }) {
  const remaining = hints.length - revealed;

  return (
    <section className="hints">
      <h2>Stuck?</h2>
      <ol>
        {hints.slice(0, revealed).map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ol>
      {remaining > 0 && (
        <button type="button" onClick={onReveal}>
          Show a hint ({remaining} left)
        </button>
      )}
    </section>
  );
}
