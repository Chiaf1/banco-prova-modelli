// Elenco degli esercizi ed esecuzione dei loro test su una soluzione.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { leggiTap } from "./calcoli.ts";

export const CARTELLA_ESERCIZI = resolve(import.meta.dirname, "..", "esercizi");
const TIMEOUT_TEST_MS = 30_000;

export type Esercizio = {
  numero: string; // "01"
  nome: string; // "01-somma-pari"
  cartella: string;
  consegna: string;
  firma: string;
  test: string; // percorso di soluzione.test.ts
};

export function elencaEsercizi(cartella = CARTELLA_ESERCIZI): Esercizio[] {
  return readdirSync(cartella)
    .filter((n) => /^\d\d-/.test(n))
    .sort()
    .map((nome) => {
      const c = join(cartella, nome);
      return {
        numero: nome.slice(0, 2),
        nome,
        cartella: c,
        consegna: readFileSync(join(c, "consegna.md"), "utf8"),
        firma: readFileSync(join(c, "firma.ts"), "utf8"),
        test: join(c, "soluzione.test.ts"),
      };
    });
}

// Impronta dei file che il modello vede o che decidono l'esito (consegna, firma, test).
export function improntaEsercizi(esercizi: Esercizio[]): string {
  const h = createHash("sha256");
  for (const e of esercizi) h.update(e.nome).update(e.consegna).update(e.firma).update(readFileSync(e.test));
  return h.digest("hex").slice(0, 16);
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
