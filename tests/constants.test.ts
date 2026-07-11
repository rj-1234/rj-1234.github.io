import { describe, it, expect } from 'vitest';
import { METRICS, PROJECTS, TIMELINE, SKILLS, NAV_ITEMS, TERMINAL_SNIPPETS } from '../src/lib/constants';

describe('constants data shape', () => {
  it('has 8 metrics, 4 of them executive', () => {
    expect(METRICS).toHaveLength(8);
    expect(METRICS.filter(m => m.executive)).toHaveLength(4);
  });

  it('has 5 projects with unique ids', () => {
    expect(PROJECTS).toHaveLength(5);
    expect(new Set(PROJECTS.map(p => p.id)).size).toBe(5);
  });

  it('has 4 timeline entries in chronological order ending Present', () => {
    expect(TIMELINE).toHaveLength(4);
    expect(TIMELINE[TIMELINE.length - 1].period).toContain('Present');
  });

  it('has 6 skill categories', () => {
    expect(SKILLS).toHaveLength(6);
  });

  it('has 7 nav items', () => {
    expect(NAV_ITEMS).toHaveLength(7);
  });

  it('has 6 terminal snippets, inference-gateway first with empty runLabel', () => {
    expect(TERMINAL_SNIPPETS).toHaveLength(6);
    expect(TERMINAL_SNIPPETS[0].id).toBe('inference-gateway');
    expect(TERMINAL_SNIPPETS[0].runLabel).toBe('');
  });
});
