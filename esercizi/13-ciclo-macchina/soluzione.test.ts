import { test } from "node:test";
import assert from "node:assert/strict";

const { simula } = await import(process.env.SOLUZIONE || "./riferimento.ts");

const r = (indice: number, evento: string, motivo: string) => ({ indice, evento, motivo });
const stato = (eventi: string[]) => {
  const { stato, pezzi, gravita, confermato } = simula(eventi);
  return { stato, pezzi, gravita, confermato };
};

test("nessun evento", () =>
  assert.deepEqual(simula([]), { stato: "fermo", pezzi: 0, gravita: 0, confermato: false, rifiutati: [] }));
test("ciclo normale", () => {
  assert.deepEqual(simula(["start", "pronto", "pezzo", "pezzo", "pausa", "riprendi", "pezzo", "stop"]), {
    stato: "fermo", pezzi: 3, gravita: 0, confermato: false, rifiutati: [],
  });
  assert.deepEqual(stato(["start", "stop", "start", "pronto", "pausa"]), { stato: "pausa", pezzi: 0, gravita: 0, confermato: false });
});
test("eventi non ammessi e sconosciuti", () => {
  const e = simula(["pezzo", "start", "start", "Start", "pronto", "pezzo"]);
  assert.equal(e.stato, "lavoro");
  assert.equal(e.pezzi, 1);
  assert.deepEqual(e.rifiutati, [r(0, "pezzo", "non ammesso in fermo"), r(2, "start", "non ammesso in avvio"), r(3, "Start", "sconosciuto")]);
  assert.deepEqual(simula(["start", "pronto", "conferma", "reset", "stop"]).rifiutati, [
    r(2, "conferma", "non ammesso in lavoro"),
    r(3, "reset", "non ammesso in lavoro"),
  ]);
  assert.deepEqual(simula(["start", "pronto", "pausa", "pezzo", "pausa", "riprendi"]).rifiutati, [
    r(3, "pezzo", "non ammesso in pausa"),
    r(4, "pausa", "non ammesso in pausa"),
  ]);
});
test("allarme, conferma e ripresa nello stato di prima", () => {
  assert.deepEqual(stato(["start", "pronto", "allarme"]), { stato: "allarme", pezzi: 0, gravita: 1, confermato: false });
  assert.deepEqual(stato(["start", "pronto", "allarme", "conferma"]), { stato: "allarme", pezzi: 0, gravita: 1, confermato: true });
  assert.deepEqual(stato(["start", "pronto", "allarme", "conferma", "riprendi", "pezzo"]), { stato: "lavoro", pezzi: 1, gravita: 0, confermato: false });
  assert.deepEqual(stato(["start", "pronto", "pausa", "allarme", "conferma", "riprendi"]).stato, "pausa");
  assert.deepEqual(stato(["start", "allarme", "conferma", "riprendi"]).stato, "avvio");
  assert.deepEqual(stato(["allarme", "conferma", "riprendi"]).stato, "fermo");
});
test("riprendi e reset senza conferma", () => {
  const e = simula(["start", "pronto", "allarme", "riprendi", "reset", "conferma", "conferma", "reset"]);
  assert.deepEqual(e.rifiutati, [
    r(3, "riprendi", "allarme da confermare"),
    r(4, "reset", "allarme da confermare"),
    r(6, "conferma", "già confermato"),
  ]);
  assert.equal(e.stato, "fermo");
});
test("altri eventi in allarme", () => {
  const e = simula(["start", "pronto", "allarme", "pezzo", "stop", "start", "boh"]);
  assert.deepEqual(e.rifiutati, [
    r(3, "pezzo", "non ammesso in allarme"),
    r(4, "stop", "non ammesso in allarme"),
    r(5, "start", "non ammesso in allarme"),
    r(6, "boh", "sconosciuto"),
  ]);
  assert.deepEqual(stato(["start", "pronto", "allarme", "pezzo", "stop", "start", "boh"]), { stato: "allarme", pezzi: 0, gravita: 1, confermato: false });
});
test("gravità: sale, si ferma a 3, toglie la conferma e blocca la ripresa", () => {
  assert.deepEqual(stato(["allarme", "conferma", "allarme"]), { stato: "allarme", pezzi: 0, gravita: 2, confermato: false });
  assert.deepEqual(stato(["allarme", "allarme", "allarme", "allarme", "allarme"]).gravita, 3);
  const e = simula(["start", "pronto", "pezzo", "allarme", "allarme", "conferma", "riprendi", "reset", "start"]);
  assert.deepEqual(e.rifiutati, [r(6, "riprendi", "gravità troppo alta")]);
  assert.deepEqual({ stato: e.stato, pezzi: e.pezzi, gravita: e.gravita }, { stato: "avvio", pezzi: 1, gravita: 0 });
});
test("allarme automatico dopo 3 rifiuti di fila", () => {
  const e = simula(["pezzo", "boh", "pausa"]);
  assert.deepEqual(e.rifiutati, [r(0, "pezzo", "non ammesso in fermo"), r(1, "boh", "sconosciuto"), r(2, "pausa", "non ammesso in fermo")]);
  assert.deepEqual(stato(["pezzo", "boh", "pausa"]), { stato: "allarme", pezzi: 0, gravita: 1, confermato: false });
  // torna nello stato da cui è scattato
  assert.equal(stato(["start", "pronto", "pausa", "x", "y", "z", "conferma", "riprendi"]).stato, "pausa");
});
test("allarme automatico: il contatore si azzera con un evento accettato", () => {
  assert.equal(stato(["pezzo", "pezzo", "start", "pezzo", "pezzo"]).stato, "avvio");
  assert.equal(stato(["pezzo", "pezzo", "start", "pezzo", "pezzo", "pezzo"]).stato, "allarme");
  // dopo l'uscita dall'allarme si riparte da zero
  assert.equal(stato(["x", "x", "x", "conferma", "riprendi", "x", "x"]).stato, "fermo");
  assert.equal(stato(["x", "x", "x", "conferma", "riprendi", "x", "x", "x"]).stato, "allarme");
});
test("allarme automatico: i rifiuti in allarme non contano", () => {
  const e = simula(["start", "pronto", "allarme", "pezzo", "pezzo", "pezzo", "pezzo", "conferma", "riprendi", "pezzo"]);
  assert.deepEqual({ stato: e.stato, pezzi: e.pezzi }, { stato: "lavoro", pezzi: 1 });
  assert.equal(e.rifiutati.length, 4);
  // due rifiuti prima dell'allarme e uno dopo la ripresa non fanno tre di fila: l'allarme è accettato
  assert.equal(stato(["start", "x", "x", "allarme", "conferma", "riprendi", "x"]).stato, "avvio");
  // il terzo rifiuto in allarme non alza la gravità
  assert.equal(stato(["allarme", "x", "x", "x", "x"]).gravita, 1);
});
test("input non modificato", () => {
  const eventi = ["start", "pronto", "boh", "pezzo"];
  const copia = [...eventi];
  simula(eventi);
  assert.deepEqual(eventi, copia);
});
