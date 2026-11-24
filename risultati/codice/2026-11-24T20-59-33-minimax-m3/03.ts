export function fizzBuzz(n: number): string[] {
  if (n === 0) {
    return [];
  }
  if (n < 0 || !Number.isInteger(n)) {
    throw new RangeError("n must be a non-negative integer");
  }

  const result: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(String(i));
    }
  }
  return result;
}
