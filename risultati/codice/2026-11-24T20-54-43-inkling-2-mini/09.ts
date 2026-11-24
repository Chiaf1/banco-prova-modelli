export function fondiIntervalli(intervalli: [number, number][]): [number, number][] {
  const valid = intervalli.map(([inizio, fine]) => {
    if (!Number.isFinite(inizio) || !Number.isFinite(fine) || inizio > fine) {
      throw new RangeError("Intervallo non valido");
    }
    return [inizio, fine] as [number, number];
  });

  valid.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const risultato: [number, number][] = [];
  for (const [inizio, fine] of valid) {
    const ultimo = risultato[risultato.length - 1];
    if (ultimo && inizio <= ultimo[1]) {
      if (fine > ultimo[1]) ultimo[1] = fine;
    } else {
      risultato.push([inizio, fine]);
    }
  }
  return risultato;
}
