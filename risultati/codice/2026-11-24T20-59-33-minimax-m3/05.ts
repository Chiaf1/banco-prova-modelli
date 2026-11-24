export function raggruppa<T>(elementi: T[], chiave: (elemento: T) => string): Record<string, T[]> {
  const risultato: Record<string, T[]> = {};
  for (const elemento of elementi) {
    const k = chiave(elemento);
    if (k in risultato) {
      risultato[k].push(elemento);
    } else {
      risultato[k] = [elemento];
    }
  }
  return risultato;
}
