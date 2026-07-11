function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function counterValue(elapsedMs: number, durationMs: number, target: number): number {
  const t = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return easeOutQuad(t) * target;
}
