export function sommaPari(numeri: number[]): number {
  let somma = 0;
  for (const n of numeri) {
    if (Number.isInteger(n) && n % 2 === 0) {
      somma += n;
    }
  }
  return somma;
}
