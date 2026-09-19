/**
 * OWNER: Person D (copy) / Person C (reveal logic)
 *
 * Hints reveal one at a time and never automatically. A player who is stuck
 * should be able to get unstuck; a player who is not should never be spoiled.
 */

export function HintPanel({ hints, revealed, onReveal }) {
  const remaining = hints.length - revealed;

  return (
    <section className="panel hints">
      <h2>Stuck?</h2>
      {revealed > 0 && (
        <ol className="hints__list">
          {hints.slice(0, revealed).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      )}
      {remaining > 0 ? (
        <button type="button" className="button--ghost" onClick={onReveal}>
          Show a hint ({remaining} left)
        </button>
      ) : (
        <p className="hints__done">That is every hint for this level.</p>
      )}
    </section>
  );
}
