export function devLog(...args: any[]) {
  try {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  } catch {
    // no-op
  }
}

export function devWarn(...args: any[]) {
  try {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  } catch {}
}

export function devError(...args: any[]) {
  try {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  } catch {}
}
