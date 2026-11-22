export function raggruppa<T>(elementi: T[], chiave: (elemento: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const elemento of elementi) {
    const key = chiave(elemento);
    if (!groups[key]) {
      groups[key] = [elemento];
    } else {
      groups[key].push(elemento);
    }
  }
  return groups;
}
