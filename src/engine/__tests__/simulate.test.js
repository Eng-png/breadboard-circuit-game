import { describe, expect, it } from 'vitest';
import { simulate, simulateAll } from '../simulate.js';
import { level1 } from '../../content/levels/level1.js';

/**
 * The canonical level-1 circuit, expressed as placements.
 *
 * Battery + rail -> switch -> resistor -> LED -> battery - rail
 *
 *   TP rail --wire--> col 5 --switch--> col 9 --resistor--> col 13
 *   col 13 --LED--> col 17 --wire--> TN rail
 *
 * @param {object} [overrides]
 */
function level1Circuit({ closed = true, backwards = false, resistor = true } = {}) {
  const led = backwards
    ? { id: 'led-1', type: 'led', holes: ['B17', 'B13'] }
    : { id: 'led-1', type: 'led', holes: ['B13', 'B17'] };

  return [
    { id: 'battery-1', type: 'battery', holes: ['TP1', 'TN1'] },
    { id: 'wire-1', type: 'wire', holes: ['TP5', 'A5'] },
    { id: 'switch-1', type: 'switch', holes: ['A5', 'A9'], state: { closed } },
    ...(resistor
      ? [{ id: 'resistor-1', type: 'resistor', holes: ['B9', 'B13'] }]
      : [{ id: 'wire-3', type: 'wire', holes: ['B9', 'B13'] }]),
    led,
    { id: 'wire-2', type: 'wire', holes: ['A17', 'TN5'] },
  ];
}

describe('simulate — the winning circuit', () => {
  it('lights the LED when the switch is closed', () => {
    const result = simulate(level1Circuit({ closed: true }));
    expect(result.complete).toBe(true);
    expect(result.shorted).toBe(false);
    expect(result.components['led-1'].lit).toBe(true);
    expect(result.components['led-1'].burnedOut).toBe(false);
    expect(result.faults).toHaveLength(0);
  });

  it('runs a realistic current: (9V - 2V) / 340 ohm is about 21 mA', () => {
    const result = simulate(level1Circuit({ closed: true }));
    expect(result.components['led-1'].currentMa).toBeCloseTo(20.6, 1);
  });

  it('energizes every component on the loop', () => {
    const result = simulate(level1Circuit({ closed: true }));
    for (const id of ['switch-1', 'resistor-1', 'led-1']) {
      expect(result.components[id].energized).toBe(true);
    }
  });
});

describe('simulate — the switch', () => {
  it('leaves the LED dark when the switch is open', () => {
    const result = simulate(level1Circuit({ closed: false }));
    expect(result.complete).toBe(false);
    expect(result.components['led-1'].lit).toBe(false);
  });

  it('explains that the gap is the switch, not a wiring mistake', () => {
    const result = simulate(level1Circuit({ closed: false }));
    expect(result.faults[0].code).toBe('SWITCH_OPEN');
    expect(result.faults[0].placementIds).toContain('switch-1');
  });

  it('can force switches open or closed without touching the placements', () => {
    const placements = level1Circuit({ closed: false });
    expect(simulate(placements, { switches: 'forceClosed' }).components['led-1'].lit).toBe(true);
    expect(simulate(placements, { switches: 'forceOpen' }).components['led-1'].lit).toBe(false);
    // The input is untouched — the caller's state is still "open".
    expect(placements.find((p) => p.id === 'switch-1').state.closed).toBe(false);
  });
});

describe('simulate — mistakes worth teaching', () => {
  it('catches a backwards LED and says which way round it goes', () => {
    const result = simulate(level1Circuit({ backwards: true }));
    expect(result.complete).toBe(false);
    expect(result.components['led-1'].lit).toBe(false);
    expect(result.faults[0].code).toBe('LED_BACKWARDS');
    expect(result.faults[0].message).toMatch(/long leg/i);
  });

  it('burns out the LED when nothing limits the current', () => {
    const result = simulate(level1Circuit({ resistor: false }));
    expect(result.components['led-1'].burnedOut).toBe(true);
    expect(result.components['led-1'].lit).toBe(false);
    expect(result.faults.some((f) => f.code === 'LED_BURNED_OUT')).toBe(true);
  });

  it('flags a bare wire from + straight to - as a short', () => {
    const result = simulate([
      { id: 'battery-1', type: 'battery', holes: ['TP1', 'TN1'] },
      { id: 'wire-1', type: 'wire', holes: ['TP5', 'A5'] },
      { id: 'wire-2', type: 'wire', holes: ['A5', 'TN5'] },
    ]);
    expect(result.shorted).toBe(true);
    expect(result.faults.some((f) => f.code === 'SHORT_CIRCUIT')).toBe(true);
  });

  it('catches both legs of a component in the same strip', () => {
    const result = simulate([
      { id: 'battery-1', type: 'battery', holes: ['TP1', 'TN1'] },
      { id: 'led-1', type: 'led', holes: ['A5', 'C5'] },
    ]);
    const fault = result.faults.find((f) => f.code === 'PINS_SAME_NET');
    expect(fault).toBeDefined();
    expect(fault.placementIds).toContain('led-1');
  });

  it('asks for a battery when there is none', () => {
    const result = simulate([{ id: 'led-1', type: 'led', holes: ['A5', 'A9'] }]);
    expect(result.faults[0].code).toBe('NO_BATTERY');
  });

  it('reports an open circuit when the loop simply does not reach', () => {
    const result = simulate([
      { id: 'battery-1', type: 'battery', holes: ['TP1', 'TN1'] },
      { id: 'wire-1', type: 'wire', holes: ['TP5', 'A5'] },
      { id: 'led-1', type: 'led', holes: ['A5', 'A9'] },
      // nothing connects column 9 back to the negative rail
    ]);
    expect(result.complete).toBe(false);
    expect(result.faults[0].code).toBe('OPEN_CIRCUIT');
  });
});

describe('simulate — robustness', () => {
  it('returns a fully-shaped result for an empty board', () => {
    const result = simulate([]);
    expect(result).toMatchObject({ complete: false, shorted: false });
    expect(Array.isArray(result.nets)).toBe(true);
    expect(result.components).toEqual({});
  });

  it('does not throw on holes that do not exist', () => {
    expect(() =>
      simulate([{ id: 'wire-1', type: 'wire', holes: ['Z99', 'A1'] }]),
    ).not.toThrow();
  });

  it('does not mutate the placements it is given', () => {
    const placements = level1Circuit();
    const before = JSON.stringify(placements);
    simulate(placements);
    expect(JSON.stringify(placements)).toBe(before);
  });
});

describe('level 1 objectives', () => {
  it('all four pass for the winning circuit', () => {
    const context = simulateAll(level1Circuit({ closed: true }));
    const failed = level1.objectives.filter((o) => !o.check(context)).map((o) => o.id);
    expect(failed).toEqual([]);
  });

  it('the switch-on objective fails when the LED is backwards', () => {
    const context = simulateAll(level1Circuit({ backwards: true }));
    const passed = level1.objectives.filter((o) => o.check(context)).map((o) => o.id);
    expect(passed).not.toContain('switch-on');
  });

  it('the protection objective fails with no resistor', () => {
    const context = simulateAll(level1Circuit({ resistor: false }));
    const passed = level1.objectives.filter((o) => o.check(context)).map((o) => o.id);
    expect(passed).not.toContain('protected');
  });

  it('a circuit that bypasses the switch does not win', () => {
    // Wire straight from the + rail to the resistor, skipping the switch.
    const context = simulateAll([
      { id: 'battery-1', type: 'battery', holes: ['TP1', 'TN1'] },
      { id: 'wire-1', type: 'wire', holes: ['TP5', 'B9'] },
      { id: 'resistor-1', type: 'resistor', holes: ['B9', 'B13'] },
      { id: 'led-1', type: 'led', holes: ['B13', 'B17'] },
      { id: 'wire-2', type: 'wire', holes: ['A17', 'TN5'] },
    ]);
    const failed = level1.objectives.filter((o) => !o.check(context)).map((o) => o.id);
    expect(failed).toContain('switch-off');
  });
});
