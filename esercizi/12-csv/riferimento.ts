export function leggiCsv(testo: string, separatore = ","): string[][] {
  if (separatore.length !== 1 || separatore === '"' || separatore === "\r" || separatore === "\n") {
    throw new RangeError("separatore non valido");
  }
  const n = testo.length;
  let i = 0, riga = 1, colonna = 1;
  const avanza = () => {
    if (testo[i] === "\n") { riga++; colonna = 1; } else colonna++;
    i++;
  };
  const errore = (r: number, c: number, motivo: string) => new SyntaxError(`riga ${r}, colonna ${c}: ${motivo}`);
  const crlf = () => testo[i] === "\r" && testo[i + 1] === "\n";

  const righe: string[][] = [];
  while (i < n) {
    if (testo[i] === "\n") { avanza(); continue; }
    if (crlf()) { avanza(); avanza(); continue; }
    const rigaInizio = riga;
    const campi: string[] = [];
    for (;;) {
      let valore = "";
      if (testo[i] === '"') {
        const [r, c] = [riga, colonna];
        avanza();
        for (;;) {
          if (i >= n) throw errore(r, c, "virgolette non chiuse");
          if (testo[i] === '"') {
            if (testo[i + 1] === '"') { valore += '"'; avanza(); avanza(); continue; }
            avanza();
            break;
          }
          valore += testo[i];
          avanza();
        }
        if (i < n && testo[i] !== separatore && testo[i] !== "\n" && testo[i] !== "\r") {
          throw errore(riga, colonna, "carattere dopo le virgolette di chiusura");
        }
      } else {
        while (i < n && testo[i] !== separatore && testo[i] !== "\n" && testo[i] !== "\r") {
          if (testo[i] === '"') throw errore(riga, colonna, "virgolette in un campo senza virgolette");
          valore += testo[i];
          avanza();
        }
      }
      campi.push(valore);
      if (i >= n) break;
      if (testo[i] === separatore) { avanza(); continue; }
      if (testo[i] === "\n") { avanza(); break; }
      if (crlf()) { avanza(); avanza(); break; }
      throw errore(riga, colonna, "a capo non valido"); // \r da solo
    }
    if (righe.length > 0 && campi.length !== righe[0].length) {
      throw errore(rigaInizio, 1, `attesi ${righe[0].length} campi, trovati ${campi.length}`);
    }
    righe.push(campi);
  }
  return righe;
}
