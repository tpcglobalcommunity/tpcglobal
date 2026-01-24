export type PathToken = string | number;

export function tokenizePath(key: string): PathToken[] {
  const tokens: PathToken[] = [];
  const re = /([^[.\]]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(key))) {
    if (m[1] !== undefined) tokens.push(m[1]);
    else if (m[2] !== undefined) tokens.push(Number(m[2]));
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
