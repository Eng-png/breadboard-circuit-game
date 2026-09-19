import { describe, expect, it } from 'vitest';
import { buildNetlist } from '../netlist.js';

/**
 * Example test file — copy this shape. Every engine behaviour gets a test that
 * a teammate could read as documentation.
 */
describe('buildNetlist', () => {
  it('connects the five holes of one column strip', () => {
    const { netOf } = buildNetlist([]);
    expect(netOf('A5')).toBe(netOf('E5'));
  });

  it('does NOT connect across the center channel', () => {
    const { netOf } = buildNetlist([]);
    expect(netOf('E5')).not.toBe(netOf('F5'));
  });

  it('does NOT connect neighbouring columns', () => {
    const { netOf } = buildNetlist([]);
    expect(netOf('A5')).not.toBe(netOf('A6'));
  });

  it('connects a whole power rail end to end', () => {
    const { netOf } = buildNetlist([]);
    expect(netOf('TP1')).toBe(netOf('TP30'));
  });

  it('keeps the positive and negative rails separate', () => {
    const { netOf } = buildNetlist([]);
    expect(netOf('TP1')).not.toBe(netOf('TN1'));
  });

  it('merges two strips when the player runs a wire between them', () => {
    const { netOf } = buildNetlist([
      { id: 'wire-1', type: 'wire', holes: ['E5', 'F5'] },
    ]);
    expect(netOf('A5')).toBe(netOf('J5'));
  });

  it('chains merges transitively through several wires', () => {
    const { netOf } = buildNetlist([
      { id: 'wire-1', type: 'wire', holes: ['A1', 'A10'] },
      { id: 'wire-2', type: 'wire', holes: ['A10', 'A20'] },
    ]);
    expect(netOf('E1')).toBe(netOf('E20'));
  });

  it('does not merge nets across a non-wire component', () => {
    const { netOf } = buildNetlist([
      { id: 'led-1', type: 'led', holes: ['A1', 'A10'] },
    ]);
    expect(netOf('A1')).not.toBe(netOf('A10'));
  });
});
