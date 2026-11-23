export function fondiIntervalli(intervalli: [number, number][]): [number, number][] {
  for (const intervallo of intervalli) {
    const inizio = intervallo[0];
    const fine = intervallo[1];
    if (!Number.isFinite(inizio) || !Number.isFinite(fine) || inizio > fine) {
      throw new RangeError("Intervallo non valido");
    }
  }

  const ordinati = intervalli
    .map(([inizio, fine]) => [inizio, fine] as [number, number])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const risultato: [number, number][] = [];
  for (const [inizio, fine] of ordinati) {
    const ultimo = risultato[risultato.length - 1];
    if (ultimo && inizio <= ultimo[1]) {
      if (fine > ultimo[1]) {
        ultimo[1] = fine;
      }
    } else {
      risultato.push([inizio, fine]);
    }
  }
  return risultato;
}
