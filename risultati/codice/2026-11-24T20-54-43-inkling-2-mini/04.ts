export function contaParole(testo: string): Record<string, number> {
  const conteggio = new Map<string, number>();
  const regex = /[\p{L}\p{N}]+/gu;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(testo)) !== null) {
    const parola = match[0].toLowerCase();
    conteggio.set(parola, (conteggio.get(parola) ?? 0) + 1);
  }

  return Object.fromEntries(conteggio);
}
