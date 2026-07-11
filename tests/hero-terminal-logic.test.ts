import { describe, it, expect } from 'vitest';
import { getInitialOrder, cycleToBack, shouldStopAutoFlip, clampScale } from '../src/lib/hero-terminal-logic';

describe('getInitialOrder', () => {
  it('reverses the ids so the first snippet renders on top of the stack', () => {
    expect(getInitialOrder(['a', 'b', 'c'])).toEqual(['c', 'b', 'a']);
  });
});

describe('cycleToBack', () => {
  it('moves the front (last) card to the back (first)', () => {
    expect(cycleToBack(['c', 'b', 'a'])).toEqual(['b', 'a', 'c']);
  });
});

describe('shouldStopAutoFlip', () => {
  it('stops on a snippet with a non-empty runLabel', () => {
    expect(shouldStopAutoFlip({ runLabel: 'Run Training' })).toBe(true);
  });

  it('does not stop on a snippet with an empty runLabel', () => {
    expect(shouldStopAutoFlip({ runLabel: '' })).toBe(false);
  });
});

describe('clampScale', () => {
  it('clamps below 0.6 up to 0.6', () => {
    expect(clampScale(0.3)).toBe(0.6);
  });

  it('clamps above 1.05 down to 1.05', () => {
    expect(clampScale(2)).toBe(1.05);
  });

  it('passes through in-range values', () => {
    expect(clampScale(0.9)).toBe(0.9);
  });
});
