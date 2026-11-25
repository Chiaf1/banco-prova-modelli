export function contaParole(testo: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const regex = /[\p{L}\p{N}]+/gu;
  for (const match of testo.matchAll(regex)) {
    const parola = match[0].toLowerCase();
    counts[parola] = (counts[parola] ?? 0) + 1;
  }
  return counts;
}
