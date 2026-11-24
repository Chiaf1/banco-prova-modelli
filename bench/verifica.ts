// Controlla gli esercizi con le risposte scritte a mano: la giusta deve superare i test, ogni
// sbagliata deve fallire (codice: riferimento.ts e firma.ts; json e testo: riferimento.* e sbagliata-*.*).
// Uso: node bench/verifica.ts
import { basename } from "node:path";
import { elencaEsercizi, eseguiTest, risposteDiProva } from "./esegui.ts";

let problemi = 0;
for (const es of elencaEsercizi()) {
  const { giusta, sbagliate } = risposteDiProva(es);
  const rif = eseguiTest(es, giusta);
  const esiti = sbagliate.map((f) => ({ file: basename(f), esito: eseguiTest(es, f) }));
  const ok = rif.superato && esiti.length > 0 && esiti.every((s) => !s.esito.superato);
  if (!ok) problemi++;
  const dettaglio = esiti.map((s) => `${s.file} ${s.esito.superato ? "SUPERATA" : `fallisce (${s.esito.fail ?? "?"} ko)`}`);
  console.log(
    `${ok ? "ok  " : "NO  "} ${es.nome} [${es.formato}]: ${basename(giusta)} ${rif.pass}/${(rif.pass ?? 0) + (rif.fail ?? 0)} superati; ` +
      (dettaglio.length ? dettaglio.join(", ") : "nessuna risposta sbagliata"),
  );
  if (!rif.superato) console.log(`     ${rif.errore}`);
}
if (problemi) {
  console.error(`${problemi} esercizi con problemi`);
  process.exit(1);
}
