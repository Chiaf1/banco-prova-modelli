export function valuta(espressione: string): number {
  const s = espressione;
  let i = 0;
  const n = s.length;

  function skipSpaces(): void {
    while (i < n && s[i] === " ") {
      i++;
    }
  }

  function parseNumber(): number {
    skipSpaces();
    const start = i;
    let seenDot = false;
    let hasDigits = false;

    while (i < n) {
      const c = s[i];

      if (c >= "0" && c <= "9") {
        hasDigits = true;
        i++;
      } else if (c === ".") {
        if (seenDot) {
          break;
        }
        seenDot = true;
        i++;
      } else {
        break;
      }
    }

    if (!hasDigits) {
      throw new SyntaxError("Numero non valido");
    }

    return Number(s.slice(start, i));
  }

  function parsePrimary(): number {
    skipSpaces();

    if (i >= n) {
      throw new SyntaxError("Espressione incompleta");
    }

    const c = s[i];

    if (c === "(") {
      i++;
      const value = parseExpression();
      skipSpaces();

      if (i >= n || s[i] !== ")") {
        throw new SyntaxError("Parentesi non bilanciate");
      }

      i++;
      return value;
    }

    if ((c >= "0" && c <= "9") || c === ".") {
      return parseNumber();
    }

    throw new SyntaxError("Token inatteso");
  }

  function parseUnary(): number {
    skipSpaces();

    if (i < n && (s[i] === "+" || s[i] === "-")) {
      const op = s[i];
      i++;
      const value = parseUnary();
      return op === "-" ? -value : value;
    }

    return parsePrimary();
  }

  function parseTerm(): number {
    let value = parseUnary();

    while (true) {
      skipSpaces();

      if (i >= n) {
        break;
      }

      const op = s[i];

      if (op === "*" || op === "/") {
        i++;
        const right = parseUnary();

        if (op === "*") {
          value *= right;
        } else {
          value /= right;
        }
      } else {
        break;
      }
    }

    return value;
  }

  function parseExpression(): number {
    let value = parseTerm();

    while (true) {
      skipSpaces();

      if (i >= n) {
        break;
      }

      const op = s[i];

      if (op === "+" || op === "-") {
        i++;
        const right = parseTerm();

        if (op === "+") {
          value += right;
        } else {
          value -= right;
        }
      } else {
        break;
      }
    }

    return value;
  }

  skipSpaces();

  if (i >= n) {
    throw new SyntaxError("Espressione vuota");
  }

  const result = parseExpression();
  skipSpaces();

  if (i < n) {
    throw new SyntaxError("Caratteri inattesi");
  }

  return result;
}
