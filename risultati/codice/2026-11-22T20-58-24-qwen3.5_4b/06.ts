export function bilanciate(testo: string): boolean {
  const stack: string[] = [];

  for (const char of testo) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else if (char === ')' || char === ']' || char === '}') {
      if (stack.length === 0) {
        return false;
      }

      const last = stack.pop();
      if (!matches(last, char)) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

function matches(open: string, close: string): boolean {
  return (open === '(' && close === ')') ||
         (open === '[' && close === ']') ||
         (open === '{' && close === '}');
}
