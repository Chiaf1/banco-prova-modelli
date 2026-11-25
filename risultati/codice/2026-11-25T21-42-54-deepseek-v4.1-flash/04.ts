export function contaParole(testo: string): Record<string, number> {
  const conteggi = new Map<string, number>();
  const normalizzato = testo.normalize("NFC").toLowerCase();
  const parole = normalizzato.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [];

  for (const parola of parole) {
    conteggi.set(parola, (conteggi.get(parola) ?? 0) + 1);
  }

  return Object.fromEntries(conteggi);
}
