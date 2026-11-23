export function bilanciate(testo: string): boolean {
  const coppie: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };
  const stack: string[] = [];

  for (const ch of testo) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (ch === ')' || ch === ']' || ch === '}') {
      if (stack.pop() !== coppie[ch]) return false;
    }
  }

  return stack.length === 0;
}
