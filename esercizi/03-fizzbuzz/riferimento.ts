export function fizzBuzz(n: number): string[] {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("n non valido");
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    out.push(i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : String(i));
  }
  return out;
}
