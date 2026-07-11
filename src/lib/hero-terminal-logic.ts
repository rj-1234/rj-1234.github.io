export function getInitialOrder(ids: string[]): string[] {
  return [...ids].reverse();
}

export function cycleToBack(order: string[]): string[] {
  return [...order.slice(1), order[0]];
}

export function shouldStopAutoFlip(snippet: { runLabel: string }): boolean {
  return snippet.runLabel !== '';
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.05;

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}
