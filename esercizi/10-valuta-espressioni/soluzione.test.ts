import { test } from "node:test";
import assert from "node:assert/strict";

const { valuta } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("numeri", () => {
  assert.equal(valuta("42"), 42);
  assert.equal(valuta("0.5"), 0.5);
  assert.equal(valuta("2."), 2);
  assert.equal(valuta(".5"), 0.5);
});
test("precedenza", () => {
  assert.equal(valuta("2 + 3 * 4"), 14);
  assert.equal(valuta("2 * 3 + 4"), 10);
  assert.equal(valuta("10 - 6 / 2"), 7);
});
test("associatività a sinistra", () => {
  assert.equal(valuta("8 - 3 - 2"), 3);
  assert.equal(valuta("8 / 4 / 2"), 1);
  assert.equal(valuta("2 - 3 + 4"), 3);
});
test("parentesi", () => {
  assert.equal(valuta("(2 + 3) * 4"), 20);
  assert.equal(valuta("((1 + 2) * (3 + 4)) / 7"), 3);
});
test("unari", () => {
  assert.equal(valuta("-3"), -3);
  assert.equal(valuta("2 * -3"), -6);
  assert.equal(valuta("--2"), 2);
  assert.equal(valuta("-(1 + 2)"), -3);
  assert.equal(valuta("+4"), 4);
  assert.equal(valuta("3 - -2"), 5);
});
test("spazi", () => assert.equal(valuta("  1+2 *3  "), 7));
test("decimali", () => assert.equal(valuta("1.5 * 2 + 0.25"), 3.25));
test("divisione per zero", () => {
  assert.equal(valuta("1 / 0"), Infinity);
  assert.equal(valuta("-1 / 0"), -Infinity);
});
test("errori di sintassi", () => {
  for (const e of ["", "   ", "1 +", "* 2", "(1 + 2", "1 + 2)", "2 3", "1 2", "1.2.3", "2 ^ 3", "abc", "()", "1 + * 2", "."]) {
    assert.throws(() => valuta(e), SyntaxError, JSON.stringify(e));
  }
});
test("niente eval", async () => {
  const { readFileSync } = await import("node:fs");
  const percorso = process.env.SOLUZIONE || new URL("./riferimento.ts", import.meta.url).pathname;
  const codice = readFileSync(percorso, "utf8");
  assert.doesNotMatch(codice, /\beval\s*\(|new\s+Function\b|\bFunction\s*\(/);
});
