/**
 * OWNER: Person A (Circuit Engine)
 *
 * The solver. Takes what the player built, returns what the electricity did.
 *
 * SCOPE: series circuits only. One loop, `I = (V - sum of forward drops) / sum of R`.
 * That covers level 1 completely. Parallel branches are deliberately out of
 * scope — see docs/ARCHITECTURE.md.
 *
 * Pure function: no React, no DOM, no randomness, no mutation of the input.
 * Always returns a fully-shaped CircuitResult, even for nonsense input, because
 * three other subsystems render from it.
 */

import { getComponent } from '../content/components.js';
import { buildNetlist } from './netlist.js';
import { buildGraph, findPath, potentiometerOhms } from './graph.js';

/** @typedef {import('../shared/types.js').Placement} Placement */
/** @typedef {import('../shared/types.js').CircuitResult} CircuitResult */
/** @typedef {import('../shared/types.js').Fault} Fault */

/**
 * @param {Placement[]} placements
 * @param {object} [options]
 * @param {'asPlaced'|'forceOpen'|'forceClosed'} [options.switches='asPlaced']
 * @returns {CircuitResult}
 */
export function simulate(placements, options = {}) {
  const { switches = 'asPlaced' } = options;

  const { nets, netOf } = buildNetlist(placements);
  const components = blankResults(placements);
  /** @type {Fault[]} */
  const faults = [];

  const done = (extra = {}) => ({
    complete: false,
    shorted: false,
    nets,
    components,
    faults,
    ...extra,
  });

  // ── Both legs in the same strip ────────────────────────────────────────
  // The single most common beginner mistake. Current takes the copper instead
  // of going through the part, so the part does nothing and nothing says why.
  for (const placement of placements) {
    if (placement.type === 'wire') continue;
    const [first, second] = placement.holes;
    if (!first || !second) continue;
    if (netOf(first) !== -1 && netOf(first) === netOf(second)) {
      faults.push({
        code: 'PINS_SAME_NET',
        message:
          `Both legs of the ${getComponent(placement.type).label.toLowerCase()} are in the same ` +
          `strip, so they are already joined by the metal inside the board. Electricity takes ` +
          `that shortcut instead of going through the part. Move one leg to a different column.`,
        placementIds: [placement.id],
      });
    }
  }

  // ── Is there a power source? ───────────────────────────────────────────
  const battery = placements.find((placement) => placement.type === 'battery');
  if (!battery) {
    faults.push({
      code: 'NO_BATTERY',
      message: 'Nothing is pushing the electricity around. Add a battery to the board.',
      placementIds: [],
    });
    return done();
  }

  const edges = buildGraph(placements, netOf, switches);
  const posNet = netOf(battery.holes[0]);
  const negNet = netOf(battery.holes[1]);

  if (posNet === -1 || negNet === -1) {
    faults.push({
      code: 'FLOATING_PIN',
      message:
        'The battery is not plugged into the board yet. Both of its legs need to sit ' +
        'in holes before it can push any electricity.',
      placementIds: [battery.id],
    });
    return done();
  }

  // + and − are the same electrical point. That is a dead short, whether the
  // player got there with a wire or by putting both legs in one strip.
  if (posNet === negNet) {
    faults.push({
      code: 'SHORT_CIRCUIT',
      message:
        'The battery’s + and − are joined directly to each other, with nothing in ' +
        'between to use the energy. That is a short circuit — in real life the battery ' +
        'gets hot. Separate them and put your LED in the path.',
      placementIds: [battery.id],
    });
    return done({ complete: true, shorted: true });
  }

  // ── Is there a complete loop? ──────────────────────────────────────────
  const path = findPath(edges, posNet, negNet);

  if (!path) {
    faults.push(diagnoseBrokenLoop(edges, posNet, negNet, placements));
    return done();
  }

  // ── There is a loop. What does the electricity do in it? ───────────────
  const volts = getComponent('battery').electrical?.volts ?? 9;
  const totalOhms = path.reduce((sum, edge) => sum + edge.ohms, 0);
  const totalForwardVolts = path.reduce((sum, edge) => sum + edge.forwardVolts, 0);

  const hasResistor = path.some((edge) => edge.type === 'resistor' || edge.type === 'potentiometer');
  const hasLed = path.some((edge) => edge.type === 'led');
  const hasFan = path.some((edge) => edge.type === 'fan');

  // A loop with no load at all: the battery is shorted across itself.
  if (!hasResistor && !hasLed && !hasFan) {
    for (const edge of path) {
      components[edge.placement.id].energized = true;
    }
    faults.push({
      code: 'SHORT_CIRCUIT',
      message:
        'You have joined + straight back to − with nothing in between. All the current ' +
        'rushes through at once, which in real life gets hot fast. Put something that uses ' +
        'the energy — like the LED and its resistor — in the loop.',
      placementIds: path.map((edge) => edge.placement.id),
    });
    return done({ complete: true, shorted: true });
  }

  const drivingVolts = volts - totalForwardVolts;

  // Not enough voltage to push past the LED's forward drop: no current at all.
  if (drivingVolts <= 0 || totalOhms <= 0) {
    return done({ complete: true });
  }

  const currentMa = (drivingVolts / totalOhms) * 1000;

  for (const edge of path) {
    const result = components[edge.placement.id];
    result.energized = true;
    result.currentMa = currentMa;

    if (edge.type === 'led') {
      const spec = getComponent('led').electrical ?? {};
      const min = spec.minCurrentMa ?? 0;
      const max = spec.maxCurrentMa ?? Infinity;

      result.burnedOut = currentMa > max;
      result.lit = !result.burnedOut && currentMa >= min;
      result.brightness = result.lit ? ledBrightness(currentMa, spec) : 0;

      if (result.burnedOut) {
        faults.push({
          code: 'LED_BURNED_OUT',
          message:
            `Too much current — about ${Math.round(currentMa)} mA, and this LED can only ` +
            `take ${max} mA. Nothing in the loop is slowing the electricity down. Add the ` +
            `resistor in series with the LED.`,
          placementIds: [edge.placement.id],
        });
      }
    }

    if (edge.type === 'fan') {
      const spec = getComponent('fan').electrical ?? {};
      result.spinning = currentMa >= (spec.minCurrentMa ?? 0);
      result.speed = result.spinning ? ledBrightness(currentMa, spec) : 0;
    }
  }

  return done({ complete: true });
}

/**
 * No path from + to −. Work out *why*, so we can say something useful instead
 * of just "open circuit".
 *
 * We re-run the search with one rule relaxed at a time. Whichever relaxation
 * makes a path appear is the thing that is wrong.
 *
 * @returns {Fault}
 */
function diagnoseBrokenLoop(edges, posNet, negNet, placements) {
  const withSwitchesClosed = findPath(edges, posNet, negNet, { ignoreSwitches: true });
  if (withSwitchesClosed) {
    const openSwitch = withSwitchesClosed.find((edge) => edge.type === 'switch');
    return {
      code: 'SWITCH_OPEN',
      message:
        'The loop is built correctly, but the switch is open — it is a deliberate gap in ' +
        'the circuit. Close it and the electricity can get all the way round.',
      placementIds: openSwitch ? [openSwitch.placement.id] : [],
    };
  }

  const eitherDirection = findPath(edges, posNet, negNet, {
    ignoreDirection: true,
    ignoreSwitches: true,
  });
  if (eitherDirection) {
    const led = eitherDirection.find((edge) => edge.type === 'led');
    return {
      code: 'LED_BACKWARDS',
      message:
        'Your loop reaches the LED, but the LED is in backwards. An LED only lets ' +
        'electricity through one way: the long leg must face the battery’s + side. ' +
        'Turn it around.',
      placementIds: led ? [led.placement.id] : [],
    };
  }

  const loose = placements.filter(
    (placement) => placement.type !== 'wire' && placement.holes.filter(Boolean).length < 2,
  );
  if (loose.length > 0) {
    return {
      code: 'FLOATING_PIN',
      message: 'Something still has a leg that is not plugged into the board.',
      placementIds: loose.map((placement) => placement.id),
    };
  }

  return {
    code: 'OPEN_CIRCUIT',
    message:
      'There is a gap in your loop. Electricity has to travel all the way from the ' +
      'battery’s + leg, through everything, and back to its − leg. Follow the path with ' +
      'your finger and find where it stops.',
    placementIds: [],
  };
}

/**
 * How bright a lit LED looks, 0..1. Linear from the minimum current it needs to
 * glow up to its nominal current, then pinned at 1 — the eye cannot tell 20 mA
 * from 28 mA, but it can tell 5 from 20. A fan's speed follows the same curve.
 */
function ledBrightness(currentMa, spec) {
  const min = spec.minCurrentMa ?? 0;
  const nominal = spec.nominalCurrentMa ?? spec.maxCurrentMa ?? min + 1;
  if (nominal <= min) return 1;
  return Math.min(1, Math.max(0, (currentMa - min) / (nominal - min)));
}

/** Every component starts off doing nothing. */
function blankResults(placements) {
  /** @type {Record<string, import('../shared/types.js').PlacementResult>} */
  const components = {};
  for (const placement of placements) {
    components[placement.id] = { energized: false, currentMa: 0 };
    if (placement.type === 'led') {
      components[placement.id].lit = false;
      components[placement.id].reverseBiased = false;
      components[placement.id].burnedOut = false;
      components[placement.id].brightness = 0;
    }
    if (placement.type === 'fan') {
      components[placement.id].spinning = false;
      components[placement.id].speed = 0;
    }
    if (placement.type === 'potentiometer') {
      components[placement.id].ohms = potentiometerOhms(
        placement,
        getComponent('potentiometer').electrical ?? {},
      );
    }
  }
  return components;
}

/**
 * Runs the three simulations an ObjectiveContext needs: as the board actually
 * is, and as it would be with every switch forced open or closed. Level 1's win
 * condition is two-sided, so it needs all three.
 *
 * @param {Placement[]} placements
 * @returns {import('../shared/types.js').ObjectiveContext}
 */
export function simulateAll(placements) {
  return {
    result: simulate(placements),
    resultOpen: simulate(placements, { switches: 'forceOpen' }),
    resultClosed: simulate(placements, { switches: 'forceClosed' }),
    placements,
  };
}
