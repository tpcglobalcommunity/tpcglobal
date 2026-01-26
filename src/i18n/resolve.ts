export type PathToken = string | number;

export function tokenizePath(key: string): PathToken[] {
  const tokens: PathToken[] = [];
  // Split on dots, but handle array indices in brackets
  const parts = key.split('.');
  for (const part of parts) {
    // Handle array indices like [0], [1], etc.
    const arrayMatch = part.match(/^(\d+)$/);
    if (arrayMatch) {
      tokens.push(Number(arrayMatch[1]));
    } else {
      tokens.push(part);
    }
  }
  return tokens;
}

export function resolvePath(obj: any, key: string): any {
  if (!obj || !key) return undefined;

  // ✅ IMPORTANT: support flat keys first
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key];
  }

  // existing dot-path traversal for nested objects
  const parts = tokenizePath(key);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p as any];
  }
  return cur;
}
