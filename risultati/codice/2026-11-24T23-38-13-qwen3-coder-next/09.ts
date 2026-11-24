export function fondiIntervalli(intervalli: [number, number][]): [number, number][] {
  // Gestione input vuoto
  if (intervalli.length === 0) {
    return [];
  }

  // Validazione degli intervalli
  for (const [inizio, fine] of intervalli) {
    // Verifica che i valori siano numeri finiti
    if (!Number.isFinite(inizio) || !Number.isFinite(fine)) {
      throw new RangeError("Valore non finito trovato negli intervalli");
    }
    // Verifica che inizio <= fine
    if (inizio > fine) {
      throw new RangeError("Inizio maggiore di fine in un intervallo");
    }
  }

  // Creazione di una copia dell'array per non modificare l'input
  const intervalliCopia = intervalli.map(([inizio, fine]) => [inizio, fine] as [number, number]);
  
  // Ordinamento per inizio crescente
  intervalliCopia.sort((a, b) => a[0] - b[0]);

  // Fusione degli intervalli
  const risultato: [number, number][] = [];
  
  for (const [inizio, fine] of intervalliCopia) {
    if (risultato.length === 0) {
      // Primo intervallo
      risultato.push([inizio, fine]);
    } else {
      const ultimo = risultato[risultato.length - 1];
      // Se l'intervallo corrente si sovrappone o tocca l'ultimo intervallo nel risultato
      if (inizio <= ultimo[1]) {
        // Fondere gli intervalli
        const nuovoInizio = ultimo[0];
        const nuovoFine = Math.max(ultimo[1], fine);
        risultato[risultato.length - 1] = [nuovoInizio, nuovoFine];
      } else {
        // Aggiungere l'intervallo come nuovo elemento
        risultato.push([inizio, fine]);
      }
    }
  }

  return risultato;
}
