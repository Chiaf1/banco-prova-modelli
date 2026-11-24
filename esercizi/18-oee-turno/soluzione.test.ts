import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const r = JSON.parse(readFileSync(process.env.SOLUZIONE || new URL("./riferimento.json", import.meta.url), "utf8"));

// Percentuale con un decimale: accetta solo l'arrotondamento giusto (± mezzo decimale).
const percentuale = (campo: string, esatto: number) => {
  assert.equal(typeof r[campo], "number", `${campo} non è un numero`);
  assert.ok(Math.abs(r[campo] - esatto) <= 0.05 + 1e-9, `${campo}: ${r[campo]}, atteso circa ${esatto.toFixed(3)}`);
};

test("oggetto con esattamente i campi richiesti", () => {
  assert.ok(r !== null && typeof r === "object" && !Array.isArray(r));
  assert.deepEqual(Object.keys(r).sort(), [
    "disponibilita", "oee", "pezzi_buoni", "pezzi_prodotti", "prestazioni", "qualita",
    "tempo_funzionamento_min", "tempo_pianificato_min",
  ]);
});
test("tempi: 480 − 45 pianificati (il controllo a campione non ferma la linea), − 45 di fermi", () => {
  assert.equal(r.tempo_pianificato_min, 435);
  assert.equal(r.tempo_funzionamento_min, 390);
});
test("pezzi: i rilavorati non sono buoni", () => {
  assert.equal(r.pezzi_prodotti, 856);
  assert.equal(r.pezzi_buoni, 856 - 22 - 9);
});
test("disponibilità, prestazioni e qualità in percentuale", () => {
  percentuale("disponibilita", (100 * 390) / 435);
  percentuale("prestazioni", (100 * 856 * 24) / 60 / 390);
  percentuale("qualita", (100 * 825) / 856);
});
test("OEE dai valori non arrotondati", () => percentuale("oee", (100 * 825 * 24) / 60 / 435));
