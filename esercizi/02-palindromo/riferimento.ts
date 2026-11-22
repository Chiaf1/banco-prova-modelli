export function palindromo(testo: string): boolean {
  const pulito = testo.toLowerCase().replace(/[^a-z0-9]/g, "");
  return pulito === [...pulito].reverse().join("");
}
