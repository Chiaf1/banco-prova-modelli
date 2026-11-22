export function contaParole(testo: string): Record<string, number> {
  const conteggi: Record<string, number> = {};
  for (const p of testo.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
    conteggi[p] = (conteggi[p] ?? 0) + 1;
  }
  return conteggi;
}
