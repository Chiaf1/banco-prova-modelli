export function raggruppa<T>(elementi: T[], chiave: (elemento: T) => string): Record<string, T[]> {
  const gruppi: Record<string, T[]> = {};
  for (const e of elementi) {
    const k = chiave(e);
    (gruppi[k] ??= []).push(e);
  }
  return gruppi;
}
