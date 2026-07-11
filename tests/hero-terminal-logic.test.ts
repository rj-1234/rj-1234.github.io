import { describe, it, expect } from 'vitest';
import { getInitialOrder, cycleToBack, stackOffset, shouldStopAutoFlip, clampScale } from '../src/lib/hero-terminal-logic';

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

describe('stackOffset', () => {
  it('front card (0 from top) has no offset', () => {
    expect(stackOffset(0)).toEqual({ x: 0, y: 0 });
  });

  it('offsets 14px diagonally per card behind the front', () => {
    expect(stackOffset(1)).toEqual({ x: 14, y: 14 });
    expect(stackOffset(2)).toEqual({ x: 28, y: 28 });
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

  it('clamps above 1.2 down to 1.2', () => {
    expect(clampScale(2)).toBe(1.2);
  });

  it('passes through in-range values', () => {
    expect(clampScale(0.9)).toBe(0.9);
  });
});
