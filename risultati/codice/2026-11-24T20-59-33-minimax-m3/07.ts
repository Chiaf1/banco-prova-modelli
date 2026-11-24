export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new RangeError("n deve essere un intero tra 1 e 3999");
  }

  const valori: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];

  let risultato = "";
  for (const [valore, simbolo] of valori) {
    while (n >= valore) {
      risultato += simbolo;
      n -= valore;
    }
  }
  return risultato;
}

export function daRomano(s: string): number {
  if (typeof s !== "string" || s.length === 0) {
    throw new RangeError("Stringa romana non valida");
  }
  if (!/^[IVXLCDM]+$/.test(s)) {
    throw new RangeError("Stringa romana non valida");
  }

  const valori: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };
  const coppieConsentite = new Set(["IV", "IX", "XL", "XC", "CD", "CM"]);

  let totale = 0;
  let i = 0;
  while (i < s.length) {
    const curr = valori[s[i]];
    const succ = i + 1 < s.length ? valori[s[i + 1]] : 0;

    if (curr < succ) {
      const coppia = s[i] + s[i + 1];
      if (!coppieConsentite.has(coppia)) {
        throw new RangeError("Stringa romana non valida");
      }
      totale += succ - curr;
      i += 2;
    } else {
      const ch = s[i];
      if (ch === "V" || ch === "L" || ch === "D") {
        if (i + 1 < s.length && s[i + 1] === ch) {
          throw new RangeError("Stringa romana non valida");
        }
      } else {
        let conteggio = 1;
        while (i + conteggio < s.length && s[i + conteggio] === ch) conteggio++;
        if (conteggio > 3) {
          throw new RangeError("Stringa romana non valida");
        }
      }
      totale += curr;
      i++;
    }
  }

  if (totale < 1 || totale > 3999) {
    throw new RangeError("Stringa romana non valida");
  }

  if (aRomano(totale) !== s) {
    throw new RangeError("Stringa romana non valida");
  }

  return totale;
}
