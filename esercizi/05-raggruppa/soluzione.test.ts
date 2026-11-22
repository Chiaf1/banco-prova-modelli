import { test } from "node:test";
import assert from "node:assert/strict";

const { raggruppa } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("per lunghezza della parola", () =>
  assert.deepEqual(raggruppa(["uno", "due", "tre", "quattro", "sei"], (s: string) => String(s.length)), {
    "3": ["uno", "due", "tre", "sei"],
    "7": ["quattro"],
  }));
test("ordine delle chiavi", () => {
  const r = raggruppa([5, 2, 7, 4], (n: number) => (n % 2 === 0 ? "pari" : "dispari"));
  assert.deepEqual(Object.keys(r), ["dispari", "pari"]);
  assert.deepEqual(r, { dispari: [5, 7], pari: [2, 4] });
});
test("array vuoto", () => assert.deepEqual(raggruppa([], () => "x"), {}));
test("oggetti, stesso riferimento", () => {
  const a = { nome: "a", tipo: "x" };
  const b = { nome: "b", tipo: "y" };
  const r = raggruppa([a, b], (o: { tipo: string }) => o.tipo);
  assert.equal(r.x[0], a);
  assert.equal(r.y[0], b);
});
test("chiave chiamata una volta per elemento", () => {
  let chiamate = 0;
  raggruppa([1, 2, 3], () => { chiamate++; return "k"; });
  assert.equal(chiamate, 3);
});
test("non modifica l'array", () => {
  const a = [3, 1, 2];
  raggruppa(a, (n: number) => String(n));
  assert.deepEqual(a, [3, 1, 2]);
});
