export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new RangeError("n deve essere un intero tra 1 e 3999");
  }

  const valori = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const simboli = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];

  let risultato = "";
  for (let i = 0; i < valori.length; i++) {
    while (n >= valori[i]) {
      risultato += simboli[i];
      n -= valori[i];
    }
  }

  return risultato;
}

export function daRomano(s: string): number {
  if (typeof s !== "string") {
    throw new RangeError("input non valido");
  }

  const mappa: { [chiave: string]: number | undefined } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let totale = 0;

  for (let i = 0; i < s.length; i++) {
    const corrente = mappa[s[i]];
    if (corrente === undefined) {
      throw new RangeError("numero romano non valido");
    }

    const successivo = i + 1 < s.length ? mappa[s[i + 1]] : 0;
    if (successivo === undefined) {
      throw new RangeError("numero romano non valido");
    }

    totale += corrente < successivo ? -corrente : corrente;
  }

  if (totale < 1 || totale > 3999) {
    throw new RangeError("numero romano fuori intervallo");
  }

  if (aRomano(totale) !== s) {
    throw new RangeError("numero romano non in forma standard");
  }

  return totale;
}
