import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const testo = readFileSync(process.env.SOLUZIONE || new URL("./riferimento.txt", import.meta.url), "utf8");
const righe = testo.replace(/\r?\n$/, "").split(/\r?\n/);
const punti = righe.map((r) => r.replace(/^\d+\. /, ""));
const parole = (s: string) => s.match(/[\p{L}\p{N}]+/gu) ?? [];
const minuscole = (s: string) => parole(s).map((p) => p.toLowerCase());

test("6 righe numerate da 1 a 6, senza righe vuote", () => {
  assert.equal(righe.length, 6);
  righe.forEach((r, i) => assert.ok(r.startsWith(`${i + 1}. `), `riga ${i + 1}: ${JSON.stringify(r)}`));
});
test("al massimo 12 parole per punto, che finisce con un punto fermo", () => {
  punti.forEach((p, i) => {
    assert.ok(parole(p).length <= 12, `punto ${i + 1}: ${parole(p).length} parole`);
    assert.ok(p.endsWith("."), `punto ${i + 1} non finisce con un punto`);
  });
});
test("nessuna parola vietata", () => {
  const vietate = ["semplicemente", "subito", "ovviamente", "attenzione", "sempre"];
  assert.deepEqual(minuscole(testo).filter((p) => vietate.includes(p)), []);
});
test("nessuna parola ripetuta nello stesso punto", () => {
  punti.forEach((p, i) => {
    const ps = minuscole(p);
    assert.deepEqual(ps.filter((x, k) => ps.indexOf(x) !== k), [], `punto ${i + 1}`);
  });
});
test("DPI in maiuscolo nel punto 1, registro nel punto 6", () => {
  assert.ok(parole(punti[0] ?? "").includes("DPI"));
  assert.ok(minuscole(punti[5] ?? "").includes("registro"));
});
test("verifica in almeno due punti", () =>
  assert.ok(punti.filter((p) => minuscole(p).includes("verifica")).length >= 2));
