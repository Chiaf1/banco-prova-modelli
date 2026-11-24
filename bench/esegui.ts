// Elenco degli esercizi ed esecuzione dei loro test su una soluzione.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { ESTENSIONE, FORMATI, leggiTap, type Formato } from "./calcoli.ts";

export const CARTELLA_ESERCIZI = resolve(import.meta.dirname, "..", "esercizi");
const TIMEOUT_TEST_MS = 30_000;

export type Esercizio = {
  numero: string; // "01"
  nome: string; // "01-somma-pari"
  cartella: string;
  formato: Formato; // da esercizio.json
  consegna: string;
  firma: string | null; // firma.ts, solo negli esercizi di codice
  test: string; // percorso di soluzione.test.ts
};

function leggiFormato(cartella: string): Formato {
  const file = join(cartella, "esercizio.json");
  if (!existsSync(file)) throw new Error(`${file} mancante: ogni esercizio dichiara il formato della risposta`);
  const { formato } = JSON.parse(readFileSync(file, "utf8"));
  if (!FORMATI.includes(formato)) throw new Error(`${file}: formato "${formato}" non valido (${FORMATI.join(", ")})`);
  return formato;
}

export function elencaEsercizi(cartella = CARTELLA_ESERCIZI): Esercizio[] {
  return readdirSync(cartella)
    .filter((n) => /^\d\d-/.test(n))
    .sort()
    .map((nome) => {
      const c = join(cartella, nome);
      const formato = leggiFormato(c);
      return {
        numero: nome.slice(0, 2),
        nome,
        cartella: c,
        formato,
        consegna: readFileSync(join(c, "consegna.md"), "utf8"),
        firma: formato === "codice" ? readFileSync(join(c, "firma.ts"), "utf8") : null,
        test: join(c, "soluzione.test.ts"),
      };
    });
}

// Impronta dei file che il modello vede o che decidono l'esito: consegna, firma (codice) o formato
// (json, testo), test. Per gli esercizi di codice è la stessa di prima del campo formato.
export function improntaEsercizi(esercizi: Esercizio[]): string {
  const h = createHash("sha256");
  for (const e of esercizi) h.update(e.nome).update(e.consegna).update(e.firma ?? e.formato).update(readFileSync(e.test));
  return h.digest("hex").slice(0, 16);
}

// Risposte scritte a mano per bench:verifica: la giusta deve passare, ogni sbagliata deve fallire.
// Codice: riferimento.ts e firma.ts. Json e testo: riferimento.<ext> e sbagliata-*.<ext>.
export function risposteDiProva(es: Esercizio): { giusta: string; sbagliate: string[] } {
  const ext = ESTENSIONE[es.formato];
  const sbagliate =
    es.formato === "codice"
      ? ["firma.ts"]
      : readdirSync(es.cartella).filter((f) => f.startsWith("sbagliata-") && f.endsWith(`.${ext}`)).sort();
  return { giusta: join(es.cartella, `riferimento.${ext}`), sbagliate: sbagliate.map((f) => join(es.cartella, f)) };
}

export type EsitoTest = {
  superato: boolean;
  pass: number | null;
  fail: number | null;
  timeout: boolean;
  durata_ms: number;
  errore: string | null; // primo pezzo dell'output se fallisce
};

// Lancia i test di un esercizio sulla soluzione indicata.
// Sandbox: permission model di Node (lettura solo della cartella dell'esercizio e della soluzione,
// niente scrittura né processi figli) e ambiente ripulito (nessuna chiave API). La rete NON è bloccata.
export function eseguiTest(es: Esercizio, soluzione: string): EsitoTest {
  const assoluta = resolve(soluzione);
  const inizio = performance.now();
  const r = spawnSync(
    process.execPath,
    [
      "--permission",
      `--allow-fs-read=${es.cartella}`,
      `--allow-fs-read=${dirname(assoluta)}`,
      "--test",
      "--test-isolation=none",
      "--test-reporter=tap",
      basename(es.test), // relativo a cwd: con un percorso assoluto il runner non trova il file sotto --permission
    ],
    {
      cwd: es.cartella,
      env: { PATH: process.env.PATH ?? "", SOLUZIONE: assoluta },
      timeout: TIMEOUT_TEST_MS,
      // SIGKILL: il test runner intercetta SIGTERM e in un ciclo sincrono non lo gestisce mai,
      // quindi con il segnale predefinito il timeout non fermerebbe il processo.
      killSignal: "SIGKILL",
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  const durata_ms = Math.round(performance.now() - inizio);
  const uscita = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  const { pass, fail } = leggiTap(r.stdout ?? "");
  const timeout = r.error !== undefined && (r.error as NodeJS.ErrnoException).code === "ETIMEDOUT";
  const superato = r.status === 0 && !timeout && (fail ?? 0) === 0 && (pass ?? 0) > 0;
  return {
    superato,
    pass,
    fail,
    timeout,
    durata_ms,
    errore: superato ? null : primoErrore(uscita, timeout),
  };
}

function primoErrore(uscita: string, timeout: boolean): string {
  if (timeout) return `timeout dopo ${TIMEOUT_TEST_MS / 1000} s`;
  const i = uscita.search(/not ok|Error/);
  return uscita.slice(Math.max(0, i), Math.max(0, i) + 600).trim();
}
