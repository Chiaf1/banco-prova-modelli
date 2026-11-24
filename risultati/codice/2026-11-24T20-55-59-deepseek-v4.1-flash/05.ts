export function raggruppa<T>(elementi: T[], chiave: (elemento: T) => string): Record<string, T[]> {
  const gruppi = new Map<string, T[]>();

  for (const elemento of elementi) {
    const k = chiave(elemento);
    const gruppo = gruppi.get(k);

    if (gruppo !== undefined) {
      gruppo.push(elemento);
    } else {
      gruppi.set(k, [elemento]);
    }
  }

  return Object.fromEntries(gruppi);
}
