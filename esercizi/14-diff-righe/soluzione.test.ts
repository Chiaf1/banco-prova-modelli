import { test } from "node:test";
import assert from "node:assert/strict";

const { diffRighe } = await import(process.env.SOLUZIONE || "./riferimento.ts");

const testo = (...r: string[]) => r.map((x) => x + "\n").join("");
const dieci = testo("1", "2", "3", "4", "5", "6", "7", "8", "9", "10");

test("esempio della consegna", () =>
  assert.equal(diffRighe("a\nb\nc\n", "a\nx\nc\n"), testo("@@ -1,3 +1,3 @@", " a", "-b", "+x", " c")));
test("testi uguali", () => {
  assert.equal(diffRighe("", ""), "");
  assert.equal(diffRighe("a\nb", "a\nb\n"), "");
  assert.equal(diffRighe(dieci, dieci, 3), "");
});
test("testo vuoto da una parte: A o B è 1, il conteggio 0", () => {
  assert.equal(diffRighe("", "a\nb"), testo("@@ -1,0 +1,2 @@", "+a", "+b"));
  assert.equal(diffRighe("a\nb\n", ""), testo("@@ -1,2 +1,0 @@", "-a", "-b"));
});
test("righe vuote e \\r", () => {
  assert.equal(diffRighe("\n", "\n\n"), testo("@@ -1,1 +1,2 @@", " ", "+"));
  assert.equal(diffRighe("a\r\nb\n", "a\nb\n"), testo("@@ -1,2 +1,2 @@", "-a\r", "+a", " b"));
  assert.equal(diffRighe("-x\n+y\n", "+y\n"), testo("@@ -1,2 +1,1 @@", "--x", " +y"));
});
test("contesto ai bordi del testo", () => {
  assert.equal(diffRighe(dieci, dieci.replace("1\n", "uno\n")), testo("@@ -1,2 +1,2 @@", "-1", "+uno", " 2"));
  assert.equal(diffRighe(dieci, dieci.replace("10\n", "dieci\n"), 2), testo("@@ -8,3 +8,3 @@", " 8", " 9", "-10", "+dieci"));
  assert.equal(diffRighe(dieci, dieci + "11\n", 0), testo("@@ -11,0 +11,1 @@", "+11"));
});
test("inserimento e cancellazione in mezzo con contesto 0", () => {
  assert.equal(diffRighe(dieci, dieci.replace("5\n", "5\nnuova\n"), 0), testo("@@ -6,0 +6,1 @@", "+nuova"));
  assert.equal(diffRighe(dieci, dieci.replace("5\n", ""), 0), testo("@@ -5,1 +5,0 @@", "-5"));
});
test("blocchi separati e blocchi fusi", () => {
  const due = dieci.replace("3\n", "tre\n").replace("7\n", "sette\n");
  assert.equal(
    diffRighe(dieci, due),
    testo("@@ -2,3 +2,3 @@", " 2", "-3", "+tre", " 4", "@@ -6,3 +6,3 @@", " 6", "-7", "+sette", " 8"),
  );
  assert.equal(
    diffRighe(dieci, due, 2),
    testo("@@ -1,9 +1,9 @@", " 1", " 2", "-3", "+tre", " 4", " 5", " 6", "-7", "+sette", " 8", " 9"),
  );
  // con 2 uguali in mezzo e contesto 1 si fondono (2 ≤ 2 * 1)
  const vicini = dieci.replace("3\n", "tre\n").replace("6\n", "sei\n");
  assert.equal(diffRighe(dieci, vicini), testo("@@ -2,6 +2,6 @@", " 2", "-3", "+tre", " 4", " 5", "-6", "+sei", " 7"));
  assert.equal(diffRighe(dieci, vicini, 0), testo("@@ -3,1 +3,1 @@", "-3", "+tre", "@@ -6,1 +6,1 @@", "-6", "+sei"));
  assert.equal(diffRighe(dieci, due, 100).split("\n")[0], "@@ -1,10 +1,10 @@");
});
test("scelta tra script minimi: prima le cancellazioni", () => {
  assert.equal(diffRighe("1\n2\n3\n", "4\n5\n6\n"), testo("@@ -1,3 +1,3 @@", "-1", "-2", "-3", "+4", "+5", "+6"));
  assert.equal(diffRighe("a\nc\n", "b\nc\n"), testo("@@ -1,2 +1,2 @@", "-a", "+b", " c"));
});
test("scelta tra script minimi: le uguali appena possibile", () => {
  assert.equal(diffRighe("x\na\n", "a\nx\n", 0), testo("@@ -1,1 +1,0 @@", "-x", "@@ -3,0 +2,1 @@", "+x"));
  assert.equal(diffRighe("a\nb\na\n", "a\n", 0), testo("@@ -2,2 +2,0 @@", "-b", "-a"));
  assert.equal(diffRighe("a\n", "b\na\nb\n"), testo("@@ -1,1 +1,3 @@", "+b", " a", "+b"));
  assert.equal(
    diffRighe("a\nb\nc\na\nb\nb\na\n", "c\nb\na\nb\na\nc\n", 0),
    testo("@@ -1,2 +1,0 @@", "-a", "-b", "@@ -4,1 +2,0 @@", "-a", "@@ -6,0 +3,1 @@", "+a", "@@ -8,0 +6,1 @@", "+c"),
  );
});
test("contesto non valido", () => {
  for (const c of [-1, 1.5, NaN, Infinity]) assert.throws(() => diffRighe("a", "b", c), RangeError, String(c));
});
test("testi lunghi", () => {
  const vecchio = Array.from({ length: 3000 }, (_, i) => `riga ${i}`).join("\n");
  const nuovo = vecchio.replace("riga 1500\n", "riga 1500 bis\n");
  assert.equal(diffRighe(vecchio, nuovo), testo("@@ -1500,3 +1500,3 @@", " riga 1499", "-riga 1500", "+riga 1500 bis", " riga 1501"));
});
