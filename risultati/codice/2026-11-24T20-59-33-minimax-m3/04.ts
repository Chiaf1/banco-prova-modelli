export function contaParole(testo: string): Record<string, number> {
  const parole = testo.toLowerCase().match(/[\p{L}\p{N}]+/gu);
  const conteggio: Record<string, number> = {};
  if (parole) {
    for (const parola of parole) {
      conteggio[parola] = (conteggio[parola] || 0) + 1;
    }
  }
  return conteggio;
}
