export function palindromo(testo: string): boolean {
  const cleaned = testo.toLowerCase().replace(/[^a-z0-9]/gi, '');
  return cleaned === cleaned.split('').reverse().join('');
}
