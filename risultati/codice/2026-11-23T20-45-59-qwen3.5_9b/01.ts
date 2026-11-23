export function sommaPari(numeri: number[]): number {
  return numeri.reduce((acc, num) => {
    if (Number.isInteger(num) && num % 2 === 0) {
      return acc + num;
    }
    return acc;
  }, 0);
}
