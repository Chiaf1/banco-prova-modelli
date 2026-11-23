export function contaParole(testo: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const matches = testo.toLowerCase().match(/[\p{L}\p{N}]+/gu);
  if (!matches) return counts;
  for (const parola of matches) {
    counts[parola] = (counts[parola] ?? 0) + 1;
  }
  return counts;
}
