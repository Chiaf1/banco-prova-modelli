export function palindromo(testo: string): boolean {
  let processed = '';
  for (const char of testo) {
    if (/[a-zA-Z0-9]/.test(char)) {
      processed += char.toLowerCase();
    }
  }
  const reversed = processed.split('').reverse().join('');
  return processed === reversed;
}
