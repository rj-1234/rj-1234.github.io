import { describe, it, expect, beforeEach } from 'vitest';
import { viewStore, toggleView } from '../src/lib/store';

describe('viewStore', () => {
  beforeEach(() => viewStore.set('executive'));

  it('defaults to executive', () => {
    expect(viewStore.get()).toBe('executive');
  });

  it('toggleView flips executive -> technical -> executive', () => {
    toggleView();
    expect(viewStore.get()).toBe('technical');
    toggleView();
    expect(viewStore.get()).toBe('executive');
  });
});
