export function contaParole(testo: string): Record<string, number> {
  const parole = testo.match(/[\p{L}\p{N}]+/gu) ?? [];
  const risultato: Record<string, number> = {};

  for (const parola of parole) {
    const chiave = parola.toLowerCase();
    risultato[chiave] = (risultato[chiave] ?? 0) + 1;
  }

  return risultato;
}
