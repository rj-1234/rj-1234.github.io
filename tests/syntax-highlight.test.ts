import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../src/lib/syntax-highlight';

describe('detectLanguage', () => {
  it('detects bash from kubectl', () => {
    expect(detectLanguage('kubectl scale deployment/inference-gateway \\')).toBe('bash');
  });

  it('detects bash from shebang', () => {
    expect(detectLanguage('#!/bin/bash')).toBe('bash');
  });

  it('detects bash from a flag', () => {
    expect(detectLanguage('  --replicas=∞ \\')).toBe('bash');
  });

  it('treats a comment line as python by default (not bash) unless it has a bash marker', () => {
    expect(detectLanguage('# Unified Inference Gateway')).toBe('python');
  });

  it('defaults unmatched lines to python', () => {
    expect(detectLanguage('class InferenceGateway:')).toBe('python');
  });
});
