export function raggruppa<T>(elementi: T[], chiave: (elemento: T) => string): Record<string, T[]> {
  const risultato: Record<string, T[]> = {};
  for (const elemento of elementi) {
    const k = chiave(elemento);
    if (!risultato[k]) {
      risultato[k] = [];
    }
    risultato[k].push(elemento);
  }
  return risultato;
}
