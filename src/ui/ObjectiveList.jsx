/**
 * OWNER: Person C  — STUB.
 *
 * The checklist. Ticking off objectives one at a time is the main feedback
 * loop, so this should animate on change rather than silently flipping.
 *
 * TODO(Person C): announce newly-passed objectives via aria-live.
 */

/**
 * @param {object} props
 * @param {Array<{ id: string, description: string, passed: boolean }>} props.objectives
 * @param {boolean} props.won
 */
export function ObjectiveList({ objectives, won }) {
  return (
    <section className="objectives">
      <h2>Goals</h2>
      <ul>
        {objectives.map((objective) => (
          <li key={objective.id} data-passed={objective.passed}>
            {objective.passed ? '✓' : '○'} {objective.description}
          </li>
        ))}
      </ul>
      {won && <p className="objectives__won">Level complete</p>}
    </section>
  );
}
