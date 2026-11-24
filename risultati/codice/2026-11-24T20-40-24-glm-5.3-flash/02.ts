export function palindromo(testo: string): boolean {
  const pulito = testo.toLowerCase().replace(/[^a-z0-9]/g, "");
  let i = 0;
  let j = pulito.length - 1;
  while (i < j) {
    if (pulito[i] !== pulito[j]) return false;
    i++;
    j--;
  }
  return true;
}
