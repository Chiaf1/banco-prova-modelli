export function valuta(espressione: string): number {
  let pos = 0;
  const n = espressione.length;

  function whitespace(): void {
    while (pos < n && /\s/.test(espressione[pos])) {
      pos++;
    }
  }

  function peek(): string {
    return pos < n ? espressione[pos] : '';
  }

  function advance(): string {
    return espressione[pos++];
  }

  function parseNumber(): number {
    let start = pos;
    let hasDot = false;
    let hasDigit = false;

    // Segno opzionale (ma non qui, verrà gestito come unario)
    // Iniziamo col primo carattere
    if (peek() === '.') {
      hasDot = true;
      advance();
      if (!/\d/.test(peek())) {
        throw new SyntaxError("Numero malformato");
      }
      hasDigit = true;
      advance();
    } else if (/\d/.test(peek())) {
      hasDigit = true;
      while (/\d/.test(peek())) {
        advance();
      }
      if (peek() === '.') {
        hasDot = true;
        advance();
        if (/\d/.test(peek())) {
          hasDigit = true;
          while (/\d/.test(peek())) {
            advance();
          }
        }
        // Se non c'è nessuna cifra dopo il punto, accettiamo solo se c'era almeno una cifra prima
        // Es: "2." è valido
      }
    } else {
      throw new SyntaxError("Numero malformato");
    }

    // Non permettere spazi dentro il numero
    if (/\s/.test(peek())) {
      throw new SyntaxError("Spazio non consentito in un numero");
    }

    const numStr = espressione.slice(start, pos);
    if (numStr === '.' || numStr === '' || (numStr === '-' && pos === start + 1)) {
      throw new SyntaxError("Numero malformato");
    }

    const num = Number(numStr);
    if (isNaN(num)) {
      throw new SyntaxError("Numero malformato");
    }
    return num;
  }

  function parsePrimary(): number {
    whitespace();

    // Parentesi
    if (peek() === '(') {
      advance(); // consume '('
      whitespace();
      const result = parseExpression();
      whitespace();
      if (peek() !== ')') {
        throw new SyntaxError("Parentesi non bilanciate");
      }
      advance(); // consume ')'
      return result;
    }

    // Numeri
    if (/\d/.test(peek()) || peek() === '.') {
      return parseNumber();
    }

    // Operatori unari
    if (peek() === '+' || peek() === '-') {
      const op = advance();
      whitespace();
      const operand = parsePrimary();
      return op === '-' ? -operand : operand;
    }

    throw new SyntaxError("Espressione non valida");
  }

  function parseTerm(): number {
    let left = parsePrimary();

    while (true) {
      whitespace();
      const op = peek();
      if (op === '*' || op === '/') {
        advance();
        whitespace();
        const right = parsePrimary();
        if (op === '*') {
          left = left * right;
        } else {
          left = left / right;
        }
      } else {
        break;
      }
    }

    return left;
  }

  function parseExpression(): number {
    let left = parseTerm();

    while (true) {
      whitespace();
      const op = peek();
      if (op === '+' || op === '-') {
        advance();
        whitespace();
        const right = parseTerm();
        if (op === '+') {
          left = left + right;
        } else {
          left = left - right;
        }
      } else {
        break;
      }
    }

    return left;
  }

  // Parsing principale
  whitespace();
  if (pos >= n) {
    throw new SyntaxError("Espressione vuota");
  }

  const result = parseExpression();
  whitespace();

  if (pos < n) {
    throw new SyntaxError("Caratteri inattesi alla fine dell'espressione");
  }

  return result;
}
