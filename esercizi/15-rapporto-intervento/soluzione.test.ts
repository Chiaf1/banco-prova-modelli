import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const r = JSON.parse(readFileSync(process.env.SOLUZIONE || new URL("./riferimento.json", import.meta.url), "utf8"));

test("è un oggetto con esattamente i campi richiesti", () => {
  assert.equal(typeof r, "object");
  assert.ok(r !== null && !Array.isArray(r));
  assert.deepEqual(Object.keys(r).sort(), [
    "cliente", "data_intervento", "esito", "km_trasferta", "macchina", "minuti_lavoro",
    "numero_rapporto", "ricambi", "ritorno_previsto", "tecnici",
  ]);
});
test("numero, data e cliente", () => {
  assert.equal(r.numero_rapporto, "RI-2026-0412");
  assert.equal(r.data_intervento, "2026-11-03"); // non il giorno in cui è scritto il rapporto
  assert.equal(r.cliente, "Ventura Stampi srl");
});
test("macchina", () => assert.deepEqual(r.macchina, { modello: "PH-250", matricola: "VS-88213/B" }));
test("tecnici: chi ha chiamato dall'ufficio non c'è", () => assert.deepEqual(r.tecnici, ["Marchetti", "Rinaldi"]));
test("minuti di lavoro: 8:30-12:15 e 13:45-15:45", () => assert.equal(r.minuti_lavoro, 225 + 120));
test("km di andata e ritorno", () => assert.equal(r.km_trasferta, 76));
test("ricambi montati, in ordine, senza il kit riportato in magazzino", () =>
  assert.deepEqual(r.ricambi, [
    { codice: "BR-6204", quantita: 2 },
    { codice: "CD-5520", quantita: 1 },
    { codice: "FU-010", quantita: 2 },
  ]));
test("esito parziale con ritorno previsto", () => {
  assert.equal(r.esito, "parziale");
  assert.equal(r.ritorno_previsto, true);
});
