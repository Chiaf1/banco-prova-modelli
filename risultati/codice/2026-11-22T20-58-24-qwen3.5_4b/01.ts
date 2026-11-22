export function sommaPari(numeri: number[]): number {
  let somma = 0;
  for (const num of numeri) {
    if (Number.isInteger(num) && num % 2 === 0) {
      somma += num;
    }
  }
  return somma;
}
