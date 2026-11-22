import { test } from "node:test";
import assert from "node:assert/strict";

const { fizzBuzz } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("primi 15", () =>
  assert.deepEqual(fizzBuzz(15), [
    "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz",
  ]));
test("n = 0", () => assert.deepEqual(fizzBuzz(0), []));
test("n = 1", () => assert.deepEqual(fizzBuzz(1), ["1"]));
test("lunghezza e valore 30", () => {
  const r = fizzBuzz(30);
  assert.equal(r.length, 30);
  assert.equal(r[29], "FizzBuzz");
});
test("negativo", () => assert.throws(() => fizzBuzz(-1), RangeError));
test("non intero", () => assert.throws(() => fizzBuzz(2.5), RangeError));
