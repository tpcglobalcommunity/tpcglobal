export function normalizeInviteCode(raw: string) {
  const up = (raw || "").toUpperCase().trim();
  // keep letters, digits, dash
  const cleaned = up.replace(/[^A-Z0-9-]/g, "");
  // force TPC- prefix
  if (cleaned.startsWith("TPC-")) return cleaned;
  if (cleaned.startsWith("TPC")) return cleaned.replace(/^TPC/, "TPC-");
  return cleaned.length ? `TPC-${cleaned.replace(/^[-]+/, "")}` : "";
}

export function isInviteCodeFormatValid(code: string) {
  // TPC-XXXXXX (3-12 after dash to allow future)
  return /^TPC-[A-Z0-9]{3,12}$/.test(code);
}
