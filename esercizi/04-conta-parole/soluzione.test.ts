import { test } from "node:test";
import assert from "node:assert/strict";

const { contaParole } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("esempio della consegna", () =>
  assert.deepEqual(contaParole("L'albero è alto, l'albero è verde"), {
    l: 2, albero: 2, "è": 2, alto: 1, verde: 1,
  }));
test("testo vuoto", () => assert.deepEqual(contaParole(""), {}));
test("solo punteggiatura", () => assert.deepEqual(contaParole(" ... !? -- "), {}));
test("maiuscole", () => assert.deepEqual(contaParole("Casa casa CASA"), { casa: 3 }));
test("cifre e trattini", () =>
  assert.deepEqual(contaParole("anno 2024, anno-2024"), { anno: 2, "2024": 2 }));
test("altri alfabeti e a capo", () =>
  assert.deepEqual(contaParole("Ελλάδα\nελλάδα città"), { "ελλάδα": 2, "città": 1 }));
