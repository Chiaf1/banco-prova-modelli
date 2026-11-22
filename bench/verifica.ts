// Controlla gli esercizi: i test devono passare con riferimento.ts e fallire con firma.ts.
// Uso: node bench/verifica.ts
import { join } from "node:path";
import { elencaEsercizi, eseguiTest } from "./esegui.ts";

let problemi = 0;
for (const es of elencaEsercizi()) {
  const rif = eseguiTest(es, join(es.cartella, "riferimento.ts"));
  const firma = eseguiTest(es, join(es.cartella, "firma.ts"));
  const ok = rif.superato && !firma.superato;
  if (!ok) problemi++;
  console.log(
    `${ok ? "ok  " : "NO  "} ${es.nome}: riferimento ${rif.pass}/${(rif.pass ?? 0) + (rif.fail ?? 0)} superati, ` +
      `firma vuota ${firma.pass} superati`,
  );
  if (!rif.superato) console.log(`     ${rif.errore}`);
}
if (problemi) {
  console.error(`${problemi} esercizi con problemi`);
  process.exit(1);
}
