export function fondiIntervalli(intervalli: [number, number][]): [number, number][] {
  if (intervalli.length === 0) {
    return [];
  }

  // Validazione e creazione di una copia ordinata per non mutare l'input originale
  const sorted = intervalli
    .map(([start, end]) => {
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        throw new RangeError("Valori non finiti");
      }
      if (start > end) {
        throw new RangeError("inizio > fine");
      }
      return [start, end];
    })
    .sort((a, b) => a[0] - b[0]);

  const risultato: [number, number][] = [];
  let currentStart = sorted[0][0];
  let currentEnd = sorted[0][1];

  for (let i = 1; i < sorted.length; i++) {
    const nextStart = sorted[i][0];
    const nextEnd = sorted[i][1];

    if (nextStart <= currentEnd) {
      // Sovrapposizione o contatto: unisci
      currentEnd = Math.max(currentEnd, nextEnd);
    } else {
      // Nessun sovrapposizione: salva l'intervallo corrente e inizia uno nuovo
      risultato.push([currentStart, currentEnd]);
      currentStart = nextStart;
      currentEnd = nextEnd;
    }
  }

  // Aggiungi l'ultimo intervallo
  risultato.push([currentStart, currentEnd]);

  return risultato;
}
