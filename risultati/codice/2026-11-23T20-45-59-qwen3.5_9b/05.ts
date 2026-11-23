export function raggruppa<T>(elementi: T[], chiave: (elemento: T) => string): Record<string, T[]> {
  const gruppi: Record<string, T[]> = {};

  for (const elemento of elementi) {
    const key = chiave(elemento);
    if (!(key in gruppi)) {
      gruppi[key] = [];
    }
    gruppi[key].push(elemento);
  }

  return gruppi;
}
