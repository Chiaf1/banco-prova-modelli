// Rigenera risultati/riepilogo.md da tutti i .jsonl di risultati/, senza chiamare nessun modello.
// Uso: npm run bench:riepilogo   (lo chiama anche il banco alla fine di ogni esecuzione)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ParametriChiamata } from "./api.ts";
import { componiRiepilogo, leggiEsecuzione, type Confronto, type Esecuzione } from "./calcoli.ts";
import { elencaEsercizi, improntaEsercizi } from "./esegui.ts";
import { VERSIONE_PROMPT } from "./prompt.ts";

export const RISULTATI = resolve(import.meta.dirname, "..", "risultati");
// I .jsonl scritti prima del campo `confronto` usavano tutti il prompt v1 e gli esercizi di oggi
// (consegne, firme e test invariati dal primo commit).
const VERSIONE_PROMPT_FILE_VECCHI = 1;

export function confrontoCorrente(parametri: ParametriChiamata): Confronto {
  const esercizi = elencaEsercizi();
  return { parametri, esercizi: esercizi.map((e) => e.nome), versione_prompt: VERSIONE_PROMPT, impronta_esercizi: improntaEsercizi(esercizi) };
}

export function leggiEsecuzioni(cartella = RISULTATI): Esecuzione[] {
  if (!existsSync(cartella)) return [];
  const tutti = elencaEsercizi();
  const predefinito = (nomi: string[]) => ({
    versione_prompt: VERSIONE_PROMPT_FILE_VECCHI,
    impronta_esercizi: improntaEsercizi(tutti.filter((e) => nomi.includes(e.nome))),
  });
  const esecuzioni: Esecuzione[] = [];
  for (const f of readdirSync(cartella).filter((f) => f.endsWith(".jsonl")).sort()) {
    const righe = readFileSync(join(cartella, f), "utf8")
      .split("\n")
      .filter((l) => l.trim())
      .flatMap((l) => {
        try {
          return [JSON.parse(l)];
        } catch {
          return []; // riga troncata da un'interruzione
        }
      });
    const e = leggiEsecuzione(righe, predefinito);
    if (e) esecuzioni.push(e);
  }
  return esecuzioni;
}

export function rigeneraRiepilogo(parametri: ParametriChiamata, cartella = RISULTATI): { file: string; esecuzioni: Esecuzione[] } {
  const esecuzioni = leggiEsecuzioni(cartella);
  const file = join(cartella, "riepilogo.md");
  writeFileSync(file, componiRiepilogo(esecuzioni, confrontoCorrente(parametri)));
  return { file, esecuzioni };
}

if (import.meta.main) {
  const config = JSON.parse(readFileSync(process.env.BENCH_MODELLI ?? join(import.meta.dirname, "modelli.json"), "utf8"));
  const { file, esecuzioni } = rigeneraRiepilogo(config.parametri_chiamata);
  console.log(`${esecuzioni.length} esecuzioni lette → ${file.replace(resolve(RISULTATI, "..") + "/", "")}`);
}
