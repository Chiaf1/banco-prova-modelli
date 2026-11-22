import { test } from "node:test";
import assert from "node:assert/strict";

const { CacheLRU } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("inserisce e legge", () => {
  const c = new CacheLRU(2);
  c.set("a", 1);
  assert.equal(c.get("a"), 1);
  assert.equal(c.get("b"), undefined);
  assert.equal(c.size, 1);
});
test("elimina il meno recente", () => {
  const c = new CacheLRU(2);
  c.set("a", 1);
  c.set("b", 2);
  c.get("a");
  c.set("c", 3);
  assert.equal(c.has("b"), false);
  assert.deepEqual(c.chiavi(), ["a", "c"]);
});
test("aggiornare non elimina e conta come uso", () => {
  const c = new CacheLRU(2);
  c.set("a", 1);
  c.set("b", 2);
  c.set("a", 10);
  assert.equal(c.size, 2);
  c.set("c", 3);
  assert.deepEqual(c.chiavi(), ["a", "c"]);
  assert.equal(c.get("a"), 10);
});
test("has non conta come uso", () => {
  const c = new CacheLRU(2);
  c.set("a", 1);
  c.set("b", 2);
  assert.equal(c.has("a"), true);
  c.set("c", 3);
  assert.equal(c.has("a"), false);
});
test("valori undefined e chiavi non stringa", () => {
  const c = new CacheLRU(3);
  const k = { id: 1 };
  c.set(k, undefined);
  c.set(0, "zero");
  assert.equal(c.has(k), true);
  assert.equal(c.get(0), "zero");
  assert.deepEqual(c.chiavi(), [k, 0]);
});
test("capacità 1", () => {
  const c = new CacheLRU(1);
  c.set("a", 1);
  c.set("b", 2);
  assert.deepEqual(c.chiavi(), ["b"]);
});
test("capacità non valida", () => {
  for (const n of [0, -1, 1.5, NaN]) assert.throws(() => new CacheLRU(n), RangeError, String(n));
});
test("size in sola lettura", () => {
  const c = new CacheLRU(2);
  const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(c), "size");
  assert.equal(typeof d?.get, "function");
  assert.equal(d?.set, undefined);
});
test("tempo costante con capacità grande", () => {
  const n = 200_000;
  const c = new CacheLRU(n);
  for (let i = 0; i < n; i++) c.set(i, i);
  for (let i = 0; i < n; i++) c.get(i);
  for (let i = n; i < 2 * n; i++) c.set(i, i);
  assert.equal(c.size, n);
  assert.equal(c.has(n - 1), false);
  assert.equal(c.get(2 * n - 1), 2 * n - 1);
});
