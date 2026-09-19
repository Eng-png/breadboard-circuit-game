/**
 * OWNER: Person C
 *
 * The checklist. Ticking objectives off one at a time is the main feedback
 * loop, so changes are announced to screen readers as well as shown.
 */

export function ObjectiveList({ objectives }) {
  const passedCount = objectives.filter((objective) => objective.passed).length;

  return (
    <section className="panel objectives">
      <h2>
        Goals <span className="objectives__score">{passedCount}/{objectives.length}</span>
      </h2>
      <ul aria-live="polite">
        {objectives.map((objective) => (
          <li key={objective.id} data-passed={objective.passed}>
            <span className="objectives__mark" aria-hidden="true">
              {objective.passed ? '✓' : '○'}
            </span>
            {objective.description}
          </li>
        ))}
      </ul>
    </section>
  );
}
