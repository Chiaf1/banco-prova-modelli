import { test } from "node:test";
import assert from "node:assert/strict";

const { fondiIntervalli } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("sovrapposti", () =>
  assert.deepEqual(fondiIntervalli([[1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 10], [15, 18]]));
test("che si toccano", () => assert.deepEqual(fondiIntervalli([[1, 3], [3, 5]]), [[1, 5]]));
test("disordinati", () => assert.deepEqual(fondiIntervalli([[8, 9], [1, 2], [2, 4]]), [[1, 4], [8, 9]]));
test("contenuti", () => assert.deepEqual(fondiIntervalli([[1, 10], [2, 3], [4, 12]]), [[1, 12]]));
test("vuoto", () => assert.deepEqual(fondiIntervalli([]), []));
test("punti e negativi", () =>
  assert.deepEqual(fondiIntervalli([[-5, -5], [0, 0], [-5, -2], [1, 1]]), [[-5, -2], [0, 0], [1, 1]]));
test("non modifica l'input", () => {
  const input: [number, number][] = [[5, 7], [1, 6]];
  const r = fondiIntervalli(input);
  assert.deepEqual(input, [[5, 7], [1, 6]]);
  assert.deepEqual(r, [[1, 7]]);
});
test("coppie nuove nel risultato", () => {
  const coppia: [number, number] = [1, 2];
  const r = fondiIntervalli([coppia]);
  assert.notEqual(r[0], coppia);
  r[0][1] = 99;
  assert.deepEqual(coppia, [1, 2]);
});
test("intervalli non validi", () => {
  assert.throws(() => fondiIntervalli([[3, 1]]), RangeError);
  assert.throws(() => fondiIntervalli([[1, 2], [0, Infinity]]), RangeError);
  assert.throws(() => fondiIntervalli([[NaN, 1]]), RangeError);
});
