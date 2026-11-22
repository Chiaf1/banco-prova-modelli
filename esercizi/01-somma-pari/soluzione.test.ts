import { test } from "node:test";
import assert from "node:assert/strict";

const { sommaPari } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("somma solo i pari", () => assert.equal(sommaPari([1, 2, 3, 4, 5, 6]), 12));
test("array vuoto", () => assert.equal(sommaPari([]), 0));
test("nessun pari", () => assert.equal(sommaPari([1, 3, 5]), 0));
test("negativi e zero", () => assert.equal(sommaPari([-4, -3, 0, 2]), -2));
test("ignora i non interi", () => assert.equal(sommaPari([2.5, 4, 3.0, 6.0]), 10));
test("non modifica l'array", () => {
  const a = [4, 1, 2];
  sommaPari(a);
  assert.deepEqual(a, [4, 1, 2]);
});
