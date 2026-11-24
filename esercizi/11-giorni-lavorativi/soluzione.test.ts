import { test } from "node:test";
import assert from "node:assert/strict";

const { giorniLavorativi } = await import(process.env.SOLUZIONE || "./riferimento.ts");

// Ogni controllo gira con fusi orari diversi: il risultato non deve cambiare.
const FUSI = ["Europe/Rome", "America/New_York", "Pacific/Auckland", "UTC"];
function inOgniFuso(controllo: () => void) {
  const prima = process.env.TZ;
  try {
    for (const fuso of FUSI) {
      process.env.TZ = fuso;
      controllo();
    }
  } finally {
    if (prima === undefined) delete process.env.TZ;
    else process.env.TZ = prima;
  }
}
const uguale = (da: string, a: string, atteso: number) =>
  assert.equal(giorniLavorativi(da, a) + 0, atteso, `${da} → ${a} (TZ ${process.env.TZ})`);

test("esempio della consegna", () => inOgniFuso(() => uguale("2024-03-25", "2024-04-05", 9)));
test("un solo giorno", () =>
  inOgniFuso(() => {
    uguale("2024-04-03", "2024-04-03", 1); // mercoledì
    uguale("2024-04-06", "2024-04-06", 0); // sabato
    uguale("2024-04-07", "2024-04-07", 0); // domenica
    uguale("2024-12-26", "2024-12-26", 0); // Santo Stefano, giovedì
    uguale("2025-01-06", "2025-01-06", 0); // Epifania, lunedì
  }));
test("Pasquetta in anni diversi", () =>
  inOgniFuso(() => {
    for (const p of ["2008-03-24", "2019-04-22", "2024-04-01", "2025-04-21", "2026-04-06", "2038-04-26", "2160-03-24"]) {
      uguale(p, p, 0);
    }
    uguale("2025-04-22", "2025-04-22", 1); // martedì dopo Pasquetta
    uguale("2024-03-31", "2024-03-31", 0); // domenica di Pasqua
  }));
test("Pasquetta e 25 aprile nello stesso giorno contano una volta", () =>
  inOgniFuso(() => uguale("2011-04-18", "2011-04-29", 9)));
test("2 giugno: non festivo dal 1990 al 2000", () =>
  inOgniFuso(() => {
    uguale("1995-06-02", "1995-06-02", 1); // venerdì
    uguale("2000-06-02", "2000-06-02", 1); // venerdì
    uguale("2006-06-02", "2006-06-02", 0); // venerdì
    uguale("2005-06-02", "2005-06-02", 0); // giovedì
  }));
test("4 ottobre: festivo solo dal 2026", () =>
  inOgniFuso(() => {
    uguale("2024-10-04", "2024-10-04", 1); // venerdì
    uguale("2027-10-04", "2027-10-04", 0); // lunedì
    uguale("2027-10-01", "2027-10-08", 5);
  }));
test("attraverso il cambio dell'ora", () =>
  inOgniFuso(() => {
    uguale("2024-10-21", "2024-11-08", 14); // 27 ottobre: torna l'ora solare; 1 novembre venerdì
    uguale("2025-03-24", "2025-04-04", 10); // 30 marzo: ora legale
    uguale("2024-10-26", "2024-10-28", 1);
  }));
test("anni interi", () =>
  inOgniFuso(() => {
    uguale("2024-01-01", "2024-12-31", 254);
    uguale("2026-01-01", "2026-12-31", 254);
    uguale("2027-01-01", "2027-12-31", 254);
    uguale("2000-01-01", "2000-12-31", 251);
  }));
test("periodo lungo e anni bisestili", () =>
  inOgniFuso(() => {
    uguale("1990-01-01", "2199-12-31", 52967);
    uguale("2100-02-26", "2100-03-01", 2); // il 2100 non è bisestile
    uguale("2000-02-28", "2000-03-01", 3); // il 2000 sì
  }));
test("ordine invertito: risultato negativo", () =>
  inOgniFuso(() => {
    uguale("2024-04-05", "2024-03-25", -9);
    uguale("2024-04-07", "2024-04-06", 0);
  }));
test("date non valide", () => {
  for (const d of [
    "", "2024-4-1", "24-04-01", "2024/04/01", "2024-04-01T00:00", " 2024-04-01", "2024-04-01 ",
    "2023-02-29", "2100-02-29", "2024-04-31", "2024-13-01", "2024-00-10", "2024-01-00", "2024-01-32",
    "1989-12-31", "2200-01-01", "abcd-ef-gh",
  ]) {
    assert.throws(() => giorniLavorativi(d, "2024-04-01"), RangeError, JSON.stringify(d));
    assert.throws(() => giorniLavorativi("2024-04-01", d), RangeError, JSON.stringify(d));
  }
  assert.equal(giorniLavorativi("2000-02-29", "2000-02-29"), 1); // esiste: il 2000 è bisestile, martedì
});
