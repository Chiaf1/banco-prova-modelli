export function bilanciate(testo: string): boolean {
  const stack: string[] = [];
  const mapping = {
    ')': '(',
    ']': '[',
    '}': '{'
  };

  for (const char of testo) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else if (char === ')' || char === ']' || char === '}') {
      const expected = mapping[char];
      if (stack.length === 0 || stack[stack.length - 1] !== expected) {
        return false;
      }
      stack.pop();
    }
    // Ignore other characters
  }

  return stack.length === 0;
}
