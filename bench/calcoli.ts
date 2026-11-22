// Funzioni pure del banco: estrazione del codice, medie, token/s, energia, riepilogo.
// Tutti i numeri del riepilogo passano da qui (test in test/bench.test.ts).
import { createHash } from "node:crypto";

// Primo blocco ```ts o ```typescript del testo; null se non c'è o non è chiuso.
export function estraiCodice(testo: string): string | null {
  const m = /```(?:ts|typescript)\b[^\n]*\n([\s\S]*?)```/i.exec(testo);
  return m ? m[1] : null;
}

// Media aritmetica ignorando null, undefined e NaN; null se non resta niente.
export function media(valori: (number | null | undefined)[]): number | null {
  const buoni = valori.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  return buoni.length ? buoni.reduce((a, b) => a + b, 0) / buoni.length : null;
}

export function somma(valori: (number | null | undefined)[]): number | null {
  const buoni = valori.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  return buoni.length ? buoni.reduce((a, b) => a + b, 0) : null;
}

// Token/s in generazione: token in uscita / (tempo totale − tempo al primo token).
export function tokenAlSecondo(
  tokenUscita: number | null | undefined,
  totaleMs: number | null | undefined,
  primoTokenMs: number | null | undefined,
): number | null {
  if (tokenUscita == null || totaleMs == null || primoTokenMs == null) return null;
  const durata = totaleMs - primoTokenMs;
  return durata > 0 ? tokenUscita / (durata / 1000) : null;
}

// Token/s del prompt: token in ingresso / tempo al primo token.
export function tokenPromptAlSecondo(
  tokenIngresso: number | null | undefined,
  primoTokenMs: number | null | undefined,
): number | null {
  if (tokenIngresso == null || primoTokenMs == null || primoTokenMs <= 0) return null;
  return tokenIngresso / (primoTokenMs / 1000);
}

export type Campione = { t: number; w: number }; // t in ms (epoch), w in watt

// Energia in Wh tra inizio e fine (ms epoch), con la regola dei trapezi sui campioni.
// Agli estremi il valore è interpolato; se l'intervallo esce dai campioni di più di `margineMs`, null.
export function whIntegrati(campioni: Campione[], inizio: number, fine: number, margineMs = 1000): number | null {
  if (fine <= inizio || campioni.length === 0) return null;
  const c = [...campioni].sort((a, b) => a.t - b.t);
  const valore = (x: number): number => {
    if (x <= c[0].t) return c[0].t - x <= margineMs ? c[0].w : NaN;
    const ultimo = c[c.length - 1];
    if (x >= ultimo.t) return x - ultimo.t <= margineMs ? ultimo.w : NaN;
    let i = 1;
    while (c[i].t < x) i++;
    const a = c[i - 1];
    const b = c[i];
    return a.w + ((b.w - a.w) * (x - a.t)) / (b.t - a.t);
  };
  const punti: Campione[] = [{ t: inizio, w: valore(inizio) }];
  for (const s of c) if (s.t > inizio && s.t < fine) punti.push(s);
  punti.push({ t: fine, w: valore(fine) });
  let wattMs = 0;
  for (let i = 1; i < punti.length; i++) {
    wattMs += ((punti[i - 1].w + punti[i].w) / 2) * (punti[i].t - punti[i - 1].t);
  }
  return Number.isNaN(wattMs) ? null : wattMs / 3_600_000;
}

// Potenza media (W) in un intervallo, dall'energia integrata.
export function potenzaMedia(campioni: Campione[], inizio: number, fine: number): number | null {
  const wh = whIntegrati(campioni, inizio, fine);
  return wh == null ? null : (wh * 3_600_000) / (fine - inizio);
}

// Riposo: la potenza ha smesso di scendere? (ultima media ≥ 95% della precedente)
export function potenzaStabile(medie: (number | null)[]): boolean {
  if (medie.length < 2) return false;
  const [prima, ultima] = medie.slice(-2);
  return prima != null && ultima != null && ultima >= prima * 0.95;
}

// "2026/11/22 20:30:11.696" (timestamp di nvidia-smi, ora locale) → ms epoch.
export function leggiDataNvidia(s: string): number {
  const m = /^(\d{4})\/(\d\d)\/(\d\d) (\d\d):(\d\d):(\d\d)(?:\.(\d+))?$/.exec(s.trim());
  if (!m) return NaN;
  const ms = Number((m[7] ?? "0").padEnd(3, "0").slice(0, 3));
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], ms).getTime();
}

// Conteggi dal reporter TAP di node:test.
export function leggiTap(uscita: string): { pass: number | null; fail: number | null } {
  const pass = /^# pass (\d+)/m.exec(uscita);
  const fail = /^# fail (\d+)/m.exec(uscita);
  return { pass: pass ? Number(pass[1]) : null, fail: fail ? Number(fail[1]) : null };
}

// Impronta stabile (chiavi ordinate) di un oggetto JSON.
export function impronta(valore: unknown): string {
  const ordina = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(ordina)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordina((v as Record<string, unknown>)[k])]))
        : v;
  return createHash("sha256").update(JSON.stringify(ordina(valore))).digest("hex").slice(0, 16);
}

export type Hardware = {
  cpu: string | null;
  gpu: string | null;
  vram_mib: number | null;
  driver: string | null;
  kernel: string | null;
  ollama: string | null;
  llama_build: string | null;
  [altro: string]: unknown;
};

// Campi rilevati che non compaiono nel testo di note/hardware.md.
export function confrontaHardware(hw: Hardware, testoNote: string): string[] {
  const controlli: [string, string | null][] = [
    ["cpu", hw.cpu ? hw.cpu.replace(/\s+\d+-Core Processor\s*$/i, "").trim() : null],
    ["gpu", hw.gpu],
    ["vram", hw.vram_mib != null ? `${hw.vram_mib} MiB` : null],
    ["driver", hw.driver],
    ["kernel", hw.kernel],
    ["ollama", hw.ollama],
    ["llama.cpp build", hw.llama_build],
  ];
  const differenze: string[] = [];
  for (const [campo, valore] of controlli) {
    if (valore == null) differenze.push(`${campo}: non rilevato`);
    else if (!testoNote.includes(valore)) differenze.push(`${campo}: "${valore}" non è in note/hardware.md`);
  }
  return differenze;
}

// "2026-11-22T20-30-05" in ora locale, usabile nei nomi di file.
export function dataEsecuzione(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

export function nomeFile(modello: string): string {
  return modello.replace(/[^A-Za-z0-9._-]+/g, "_");
}

// ---- Riepilogo ----

export type RigaEsercizio = {
  superato: boolean;
  token_al_secondo: number | null;
  primo_token_ms: number | null;
  totale_ms: number | null;
  token_uscita: number | null;
  wh: number | null;
  finish_reason: string | null;
  ragionamento_visto: boolean;
  errore_api: string | null;
};

export type Riassunto = {
  modello: string;
  data: string;
  esercizi: number;
  superati: number;
  media_token_al_secondo: number | null;
  media_primo_token_s: number | null;
  media_totale_s: number | null;
  media_token_uscita: number | null;
  wh_totali: number | null;
  media_wh: number | null;
  troncati: number; // finish_reason "length"
  errori_api: number;
  ragiona: "sì" | "no" | "in parte";
  riposo_w: number | null;
  prompt_token_al_secondo: number | null;
  prompt_token: number | null;
  completo: boolean;
  note: string;
};

export function riassumi(
  esercizi: RigaEsercizio[],
  extra: {
    modello: string;
    data: string;
    riposo_w: number | null;
    prompt_token_al_secondo: number | null;
    prompt_token: number | null;
    completo: boolean;
    note: string;
  },
): Riassunto {
  const conRagionamento = esercizi.filter((e) => e.ragionamento_visto).length;
  return {
    ...extra,
    esercizi: esercizi.length,
    superati: esercizi.filter((e) => e.superato).length,
    media_token_al_secondo: media(esercizi.map((e) => e.token_al_secondo)),
    media_primo_token_s: media(esercizi.map((e) => (e.primo_token_ms == null ? null : e.primo_token_ms / 1000))),
    media_totale_s: media(esercizi.map((e) => (e.totale_ms == null ? null : e.totale_ms / 1000))),
    media_token_uscita: media(esercizi.map((e) => e.token_uscita)),
    wh_totali: somma(esercizi.map((e) => e.wh)),
    media_wh: media(esercizi.map((e) => e.wh)),
    troncati: esercizi.filter((e) => e.finish_reason === "length").length,
    errori_api: esercizi.filter((e) => e.errore_api != null).length,
    ragiona: conRagionamento === 0 ? "no" : conRagionamento === esercizi.length ? "sì" : "in parte",
  };
}

// Numero con la virgola decimale; "–" se manca.
export function formato(n: number | null | undefined, decimali: number): string {
  return n == null || Number.isNaN(n) ? "–" : n.toFixed(decimali).replace(".", ",");
}

const INTESTAZIONE =
  "| Modello | Data | Superati | tok/s medi | Primo token medio (s) | Tempo medio (s) | Token uscita medi | Wh totali | Wh medi | Riposo (W) | Prompt tok/s (token) | Ragiona | Troncati | Note |";
const SEPARATORE = "|" + "---|".repeat(14);

const INTRO = `# Riepilogo del banco

Una riga per modello: l'ultima esecuzione. Scritto da \`npm run bench\`, non modificare a mano.
Il dettaglio (ogni chiamata, hardware, parametri) è nei file \`risultati/<data>-<modello>.jsonl\`.

- tok/s medi: media sugli esercizi di token in uscita / (tempo totale − tempo al primo token).
- Primo token: primo frammento in streaming, ragionamento compreso.
- Wh: energia della sola GPU (nvidia-smi ogni 500 ms), integrata sulla durata di ogni chiamata; il riposo non è sottratto.
- Prompt tok/s: token in ingresso / tempo al primo token su un prompt lungo (max_tokens 1).
- Troncati: risposte con finish_reason "length".
`;

export function rigaRiepilogo(r: Riassunto): string {
  const celle = [
    r.modello,
    r.data,
    `${r.superati}/${r.esercizi}${r.completo ? "" : " (incompleto)"}`,
    formato(r.media_token_al_secondo, 1),
    formato(r.media_primo_token_s, 2),
    formato(r.media_totale_s, 1),
    formato(r.media_token_uscita, 0),
    formato(r.wh_totali, 3),
    formato(r.media_wh, 4),
    formato(r.riposo_w, 1),
    `${formato(r.prompt_token_al_secondo, 0)} (${formato(r.prompt_token, 0)})`,
    r.ragiona,
    String(r.troncati),
    [r.errori_api ? `errori API: ${r.errori_api}` : "", r.note].filter(Boolean).join("; ").replace(/\|/g, "/"),
  ];
  return `| ${celle.join(" | ")} |`;
}

// Sostituisce (o aggiunge) la riga del modello nella tabella del riepilogo.
export function aggiornaRiepilogo(testo: string | null, modello: string, riga: string): string {
  const righe = new Map<string, string>();
  for (const l of (testo ?? "").split("\n")) {
    if (!l.startsWith("| ") || l === INTESTAZIONE || l.startsWith("|---")) continue;
    const nome = l.split("|")[1].trim();
    if (nome !== "Modello") righe.set(nome, l);
  }
  righe.set(modello, riga);
  return `${INTRO}\n${INTESTAZIONE}\n${SEPARATORE}\n${[...righe.values()].join("\n")}\n`;
}
