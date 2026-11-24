export function palindromo(testo: string): boolean {
  let i = 0;
  let j = testo.length - 1;

  while (i < j) {
    const ci = testo.charCodeAt(i);
    if (!isAsciiAlnum(ci)) {
      i++;
      continue;
    }

    const cj = testo.charCodeAt(j);
    if (!isAsciiAlnum(cj)) {
      j--;
      continue;
    }

    if (toLowerAscii(ci) !== toLowerAscii(cj)) {
      return false;
    }

    i++;
    j--;
  }

  return true;
}

function isAsciiAlnum(code: number): boolean {
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122)
  );
}

function toLowerAscii(code: number): number {
  if (code >= 65 && code <= 90) {
    return code + 32;
  }
  return code;
}
