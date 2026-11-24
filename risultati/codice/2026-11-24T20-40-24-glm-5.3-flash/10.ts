export function valuta(espressione: string): number {
  let i = 0;
  const s = espressione;

  function errore(): never {
    throw new SyntaxError(`Espressione non valida: "${espressione}"`);
  }

  function saltaSpazi(): void {
    while (i < s.length && s[i] === " ") i++;
  }

  function parseNumero(): number {
    const start = i;
    while (i < s.length && s[i] >= "0" && s[i] <= "9") i++;
    if (i < s.length && s[i] === ".") {
      i++;
      while (i < s.length && s[i] >= "0" && s[i] <= "9") i++;
    }
    if (start === i) errore();
    const testo = s.slice(start, i);
    if (testo === ".") errore();
    const n = Number(testo);
    if (Number.isNaN(n)) errore();
    return n;
  }

  function parsePrimario(): number {
    saltaSpazi();
    if (i >= s.length) errore();
    const c = s[i];
    if (c === "(") {
      i++;
      const v = parseEspressione();
      saltaSpazi();
      if (i >= s.length || s[i] !== ")") errore();
      i++;
      return v;
    }
    if (c === "+" || c === "-") {
      i++;
      const v = parsePrimario();
      return c === "-" ? -v : v;
    }
    if (c >= "0" && c <= "9") return parseNumero();
    if (c === ".") {
      const start = i;
      i++;
      while (i < s.length && s[i] >= "0" && s[i] <= "9") i++;
      const testo = s.slice(start, i);
      const n = Number(testo);
      if (Number.isNaN(n)) errore();
      return n;
    }
    errore();
  }

  function parseTermine(): number {
    let v = parsePrimario();
    for (;;) {
      saltaSpazi();
      if (i < s.length && (s[i] === "*" || s[i] === "/")) {
        const op = s[i];
        i++;
        const r = parsePrimario();
        v = op === "*" ? v * r : v / r;
      } else return v;
    }
  }

  function parseEspressione(): number {
    let v = parseTermine();
    for (;;) {
      saltaSpazi();
      if (i < s.length && (s[i] === "+" || s[i] === "-")) {
        const op = s[i];
        i++;
        const r = parseTermine();
        v = op === "+" ? v + r : v - r;
      } else return v;
    }
  }

  const risultato = parseEspressione();
  saltaSpazi();
  if (i !== s.length) errore();
  return risultato;
}
