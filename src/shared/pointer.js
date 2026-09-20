/**
 * Pointer-event plumbing shared by everything draggable.
 *
 * OWNED BY: everyone (shared), but read the comment before changing it —
 * touch and mouse disagree here in a way that is easy to break by accident.
 */

/**
 * Touch and pen browsers capture the pointer to whatever you first touched, so
 * every later move event is delivered to that element no matter where your
 * finger actually is. That would stop the holes underneath from ever seeing the
 * drag. Handing the capture straight back is what makes dragging behave the
 * same with a finger as with a mouse.
 *
 * @param {PointerEvent} event
 */
export function releaseImplicitCapture(event) {
  const target = event.target;
  if (target?.hasPointerCapture?.(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
}
