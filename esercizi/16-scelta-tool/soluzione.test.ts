import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const r = JSON.parse(readFileSync(process.env.SOLUZIONE || new URL("./riferimento.json", import.meta.url), "utf8"));

test("oggetto con esattamente tool e argomenti", () => {
  assert.ok(r !== null && typeof r === "object" && !Array.isArray(r));
  assert.deepEqual(Object.keys(r).sort(), ["argomenti", "tool"]);
});
test("tool: storico_sensore (leggi_sensore arriva al massimo a 120 minuti)", () => assert.equal(r.tool, "storico_sensore"));
test("argomenti: esattamente quelli dello schema", () =>
  assert.deepEqual(Object.keys(r.argomenti ?? {}).sort(), ["a", "da", "macchina", "sensore"]));
test("macchina e sensore", () => {
  assert.equal(r.argomenti?.macchina, "P-07");
  assert.equal(r.argomenti?.sensore, "temperatura_olio");
});
test("intervallo: dalle 8:10 alle 10:40 del 16 novembre 2026", () => {
  assert.equal(r.argomenti?.da, "2026-11-16T08:10");
  assert.equal(r.argomenti?.a, "2026-11-16T10:40");
});
