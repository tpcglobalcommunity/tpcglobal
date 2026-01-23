export const isDev =
  typeof import.meta !== "undefined" &&
  !!(import.meta as any).env &&
  !!(import.meta as any).env.DEV;

export function devLog(...args: any[]) {
  if (isDev) console.log(...args);
}

export function devWarn(...args: any[]) {
  if (isDev) console.warn(...args);
}

export function devError(...args: any[]) {
  if (isDev) console.error(...args);
}
