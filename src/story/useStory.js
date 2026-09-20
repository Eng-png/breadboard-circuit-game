/**
 * OWNER: Person C (Game Shell & Story)
 *
 * Walks the player through a story's beats, one line at a time.
 *
 * Deliberately dumb: it knows the current beat and how far through its lines we
 * are, and nothing else. It does not know about circuits, and the puzzle does
 * not know about it. They meet in StoryScreen.
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * @param {{ beats: Array<{ id: string, lines: string[], mode: string, next: string|null }> }} story
 */
export function useStory(story) {
  const [beatId, setBeatId] = useState(story.beats[0].id);
  const [lineIndex, setLineIndex] = useState(0);

  const beat = story.beats.find((candidate) => candidate.id === beatId) ?? story.beats[0];

  // Puzzle beats show their whole briefing at once — it is instructions, not drama.
  // Everything else, the closing beat included, is read a line at a time.
  const revealAll = beat.mode === 'puzzle';
  const visibleLines = revealAll ? beat.lines : beat.lines.slice(0, lineIndex + 1);
  const hasMoreLines = !revealAll && lineIndex < beat.lines.length - 1;

  const goTo = useCallback((id) => {
    setBeatId(id);
    setLineIndex(0);
  }, []);

  const nextLine = useCallback(() => {
    setLineIndex((index) => index + 1);
  }, []);

  const advance = useCallback(() => {
    if (hasMoreLines) nextLine();
    else if (beat.next) goTo(beat.next);
  }, [hasMoreLines, nextLine, beat.next, goTo]);

  const restart = useCallback(() => goTo(story.beats[0].id), [goTo, story.beats]);

  // Space or Enter steps the story forward, the way every visual novel works.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLElement && event.target.closest('button, input')) return;
      if (beat.mode === 'puzzle') return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advance, beat.mode]);

  return { beat, visibleLines, hasMoreLines, advance, goTo, restart };
}
