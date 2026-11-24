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
// Tempo per operazione (ns) su una cache piena di capacità n, con letture di chiavi recenti,
// vecchie e assenti, aggiornamenti e sfratti. Blocchi da 410 operazioni ripetuti per almeno 30 ms;
// vale la migliore di 3 misure, per ridurre il rumore.
function nsPerOperazione(n: number): number {
  const c = new CacheLRU(n);
  for (let i = 0; i < n; i++) c.set(i, i);
  let prossima = n;
  let ops = 0;
  const blocco = () => {
    for (let i = 0; i < 100; i++) {
      c.get(prossima - 1 - (i % 50)); // recente
      c.get(prossima - n + 1 + i); // tra le più vecchie
      c.get(-1 - i); // assente
      c.set(prossima - 2 - i, i); // aggiorna
      if (i % 10 === 0) c.set(prossima++, 0); // sfratta la meno recente
    }
    ops += 410;
  };
  let migliore = Infinity;
  for (let r = 0; r < 3; r++) {
    ops = 0;
    const inizio = performance.now();
    do blocco(); while (performance.now() - inizio < 30);
    migliore = Math.min(migliore, (performance.now() - inizio) / ops);
  }
  assert.equal(c.size, n);
  assert.equal(c.get(prossima - 1), 0);
  return migliore * 1e6;
}

// Indipendente dalla velocità della macchina: conta come cresce il tempo per operazione da
// capacità 10_000 a 200_000. O(1) dà circa 2 (cache del processore), O(n) circa 20; soglia 6.
test("tempo costante con capacità grande", (t) => {
  const piccola = nsPerOperazione(10_000);
  const grande = nsPerOperazione(200_000);
  const misura = `tempo per operazione ${piccola.toFixed(0)} ns con 10_000, ${grande.toFixed(0)} ns con 200_000: ×${(grande / piccola).toFixed(1)}`;
  t.diagnostic(misura);
  assert.ok(grande / piccola < 6, misura);
});
