export type Language = 'python' | 'bash';

const BASH_MARKERS = ['kubectl', '#!'];

export function detectLanguage(line: string): Language {
  const trimmed = line.trim();
  if (BASH_MARKERS.some(marker => trimmed.includes(marker))) return 'bash';
  if (/^--\S/.test(trimmed)) return 'bash';
  return 'python';
}

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while',
  'try', 'except', 'with', 'as', 'in', 'is', 'not', 'and', 'or', 'True', 'False', 'None',
]);

interface Token {
  text: string;
  className: string;
}

function highlightPython(line: string): Token[] {
  if (line.trim().startsWith('#')) {
    return [{ text: line, className: 'text-[#a09d96]' }];
  }

  const tokens: Token[] = [];
  const parts = line.split(/(\s+|"[^"]*"|'[^']*'|\b\w+\b|[^\w\s]+)/g).filter(Boolean);

  for (const part of parts) {
    if (/^["'].*["']$/.test(part)) {
      tokens.push({ text: part, className: 'text-green-300' });
    } else if (PYTHON_KEYWORDS.has(part)) {
      tokens.push({ text: part, className: 'text-purple-400' });
    } else if (part === 'self') {
      tokens.push({ text: part, className: 'text-red-300/70' });
    } else if (/^\d+(\.\d+)?$/.test(part)) {
      tokens.push({ text: part, className: 'text-orange-300' });
    } else if (/^[A-Z]\w*$/.test(part)) {
      tokens.push({ text: part, className: 'text-yellow-300' });
    } else if (/^\w+$/.test(part) && /^\w+\s*\(/.test(line.slice(line.indexOf(part)))) {
      tokens.push({ text: part, className: 'text-blue-300' });
    } else {
      tokens.push({ text: part, className: '' });
    }
  }
  return tokens;
}

function highlightBash(line: string): Token[] {
  const tokens: Token[] = [];
  const parts = line.split(/(\s+|"[^"]*"|'[^']*'|\$\w+|--?[\w-]+|\b\w+\b)/g).filter(Boolean);

  let first = true;
  for (const part of parts) {
    if (/^["'].*["']$/.test(part)) {
      tokens.push({ text: part, className: 'text-green-300' });
    } else if (/^\$\w+/.test(part)) {
      tokens.push({ text: part, className: 'text-orange-300' });
    } else if (/^--?[\w-]+/.test(part)) {
      tokens.push({ text: part, className: 'text-blue-300' });
    } else if (first && /^\w+$/.test(part)) {
      tokens.push({ text: part, className: 'text-yellow-300' });
      first = false;
    } else {
      tokens.push({ text: part, className: '' });
    }
    if (!/^\s+$/.test(part)) first = false;
  }
  return tokens;
}

export function highlightLine(line: string): Token[] {
  return detectLanguage(line) === 'bash' ? highlightBash(line) : highlightPython(line);
}
