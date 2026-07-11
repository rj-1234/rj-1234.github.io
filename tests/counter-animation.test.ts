import { describe, it, expect } from 'vitest';
import { counterValue } from '../src/lib/counter-animation';

describe('counterValue', () => {
  it('returns 0 at elapsed=0', () => {
    expect(counterValue(0, 1000, 100)).toBe(0);
  });

  it('returns the target once elapsed >= duration', () => {
    expect(counterValue(1000, 1000, 100)).toBe(100);
    expect(counterValue(2000, 1000, 100)).toBe(100);
  });

  it('eases — value at the midpoint is greater than half the target (ease-out)', () => {
    const mid = counterValue(500, 1000, 100);
    expect(mid).toBeGreaterThan(50);
    expect(mid).toBeLessThan(100);
  });
});
