export function valuta(espressione: string): number {
  const simboli: string[] = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|([-+*/()]))/y;
  let pos = 0;
  while (pos < espressione.length) {
    if (/^\s*$/.test(espressione.slice(pos))) break;
    re.lastIndex = pos;
    const m = re.exec(espressione);
    if (!m) throw new SyntaxError(`carattere non valido alla posizione ${pos}`);
    simboli.push(m[1] ?? m[2]);
    pos = re.lastIndex;
  }
  let i = 0;
  const somma = (): number => {
    let v = prodotto();
    while (simboli[i] === "+" || simboli[i] === "-") v = simboli[i++] === "+" ? v + prodotto() : v - prodotto();
    return v;
  };
  const prodotto = (): number => {
    let v = unario();
    while (simboli[i] === "*" || simboli[i] === "/") v = simboli[i++] === "*" ? v * unario() : v / unario();
    return v;
  };
  const unario = (): number => {
    if (simboli[i] === "-") { i++; return -unario(); }
    if (simboli[i] === "+") { i++; return unario(); }
    return primario();
  };
  const primario = (): number => {
    const s = simboli[i++];
    if (s === "(") {
      const v = somma();
      if (simboli[i++] !== ")") throw new SyntaxError("manca )");
      return v;
    }
    if (s !== undefined && /^[\d.]/.test(s)) {
      // un numero seguito subito da un altro (es. "1 2" o "1.2.3") è un errore
      if (simboli[i] !== undefined && /^[\d.]/.test(simboli[i])) throw new SyntaxError("numero malformato");
      return Number(s);
    }
    throw new SyntaxError("atteso un numero o (");
  };
  const v = somma();
  if (i !== simboli.length) throw new SyntaxError("simboli in più");
  return v;
}
