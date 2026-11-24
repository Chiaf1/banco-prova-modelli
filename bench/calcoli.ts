// Funzioni pure del banco: estrazione del codice, medie, token/s, energia, riepilogo.
// Tutti i numeri del riepilogo passano da qui (test in test/bench.test.ts).
import { createHash } from "node:crypto";

// Formato della risposta che un esercizio chiede (dichiarato in esercizi/NN-nome/esercizio.json).
export type Formato = "codice" | "json" | "testo";
export const FORMATI: readonly Formato[] = ["codice", "json", "testo"];
// Linguaggio del blocco che il modello deve scrivere ed estensione del file in cui il banco lo salva.
export const LINGUAGGIO: Record<Formato, string> = { codice: "ts", json: "json", testo: "text" };
export const ESTENSIONE: Record<Formato, string> = { codice: "ts", json: "json", testo: "txt" };
const ALIAS: Record<Formato, string> = { codice: "ts|typescript", json: "json", testo: "text|txt" };

// Categoria del riepilogo: gli esercizi senza formato (righe scritte prima del campo) sono di codice.
export type Categoria = "codice" | "non codice";
export const categoria = (f: Formato | null | undefined): Categoria => (f == null || f === "codice" ? "codice" : "non codice");

// Primo blocco recintato del formato (```ts o ```typescript, ```json, ```text o ```txt);
// null se non c'è o non è chiuso. Il blocco è obbligatorio anche per json e testo.
export function estraiRisposta(testo: string, formato: Formato): string | null {
  const m = new RegExp("```(?:" + ALIAS[formato] + ")\\b[^\\n]*\\n([\\s\\S]*?)```", "i").exec(testo);
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
  formato?: Formato; // assente nelle righe scritte prima del campo: codice
  superato: boolean;
  token_al_secondo: number | null;
  primo_token_ms: number | null;
  totale_ms: number | null;
  token_uscita: number | null;
  token_ragionamento?: number | null; // dall'usage, se l'API lo riporta
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
  superati_codice: number;
  superati_non_codice: number;
  media_token_al_secondo: number | null;
  media_primo_token_s: number | null;
  media_totale_s: number | null;
  media_token_uscita: number | null;
  media_token_ragionamento: number | null;
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
    superati_codice: esercizi.filter((e) => e.superato && categoria(e.formato) === "codice").length,
    superati_non_codice: esercizi.filter((e) => e.superato && categoria(e.formato) === "non codice").length,
    media_token_al_secondo: media(esercizi.map((e) => e.token_al_secondo)),
    media_primo_token_s: media(esercizi.map((e) => (e.primo_token_ms == null ? null : e.primo_token_ms / 1000))),
    media_totale_s: media(esercizi.map((e) => (e.totale_ms == null ? null : e.totale_ms / 1000))),
    media_token_uscita: media(esercizi.map((e) => e.token_uscita)),
    media_token_ragionamento: media(esercizi.map((e) => e.token_ragionamento)),
    wh_totali: somma(esercizi.map((e) => e.wh)),
    media_wh: media(esercizi.map((e) => e.wh)),
    troncati: esercizi.filter((e) => e.finish_reason === "length").length,
    errori_api: esercizi.filter((e) => e.errore_api != null).length,
    ragiona: conRagionamento === 0 ? "no" : conRagionamento === esercizi.length ? "sì" : "in parte",
  };
}

// Costo in $ di un'esecuzione: somma di usage.cost delle chiamate (prompt lungo ed esercizi).
// Mai stimato: null se nessuna chiamata ha un usage o se una chiamata con usage non riporta il costo
// (es. Gemini). Le chiamate fallite senza usage non entrano nella somma.
export function costoEsecuzione(usages: unknown[]): number | null {
  let totale = 0;
  let viste = 0;
  for (const u of usages) {
    if (u == null || typeof u !== "object") continue;
    const c = (u as { cost?: unknown }).cost;
    if (typeof c !== "number" || !Number.isFinite(c)) return null;
    totale += c;
    viste++;
  }
  return viste ? totale : null;
}

export function costoPerSuperato(costo: number | null, superati: number): number | null {
  return costo == null || superati <= 0 ? null : costo / superati;
}

// Ciò che deve essere uguale perché due esecuzioni siano confrontabili tra modelli diversi.
// (L'impronta del banco contiene anche la configurazione del modello, quindi è diversa per ognuno.)
export type Confronto = {
  parametri: Record<string, unknown>;
  esercizi: string[]; // nomi degli esercizi previsti
  formati?: Record<string, Formato>; // formato di ogni esercizio; assente nei file vecchi (tutti codice)
  versione_prompt: number;
  impronta_esercizi: string;
};

export function chiaveConfronto(c: Confronto): string {
  return impronta(c);
}

export function descriviConfronto(c: Confronto): string {
  const parametri = Object.entries(c.parametri).map(([k, v]) => `${k} ${v}`).join(", ");
  const n = c.esercizi.length;
  const es = n === 0 ? "nessun esercizio" : n === 1 ? `1 esercizio (${c.esercizi[0]})` : `${n} esercizi (${c.esercizi[0]} … ${c.esercizi[n - 1]})`;
  return `${parametri}; ${es}; prompt v${c.versione_prompt}`;
}

export type Esecuzione = {
  modello: string;
  data: string;
  locale: boolean;
  confronto: Confronto;
  chiave: string;
  riassunto: Riassunto;
  esiti: Record<string, boolean>; // superato per nome di esercizio (solo quelli eseguiti)
  costo_usd: number | null;
};

type RigaJsonl = Record<string, any>;

// Un'esecuzione dalle righe del suo .jsonl; null se manca la riga "fine" o non c'è nessun esercizio.
// I numeri sono ricalcolati dalle righe degli esercizi. I file scritti prima del campo `confronto`
// lo ricavano: esercizi dalle righe (quei run erano tutti completi), versione del prompt e
// impronta degli esercizi da `predefinito`.
export function leggiEsecuzione(
  righe: RigaJsonl[],
  predefinito: (esercizi: string[]) => { versione_prompt: number; impronta_esercizi: string },
): Esecuzione | null {
  const fine = righe.find((r) => r.tipo === "fine");
  const esercizi = righe.filter((r) => r.tipo === "esercizio");
  if (!fine || esercizi.length === 0) return null;
  const confronto: Confronto = fine.confronto ?? {
    parametri: fine.parametri_chiamata,
    esercizi: esercizi.map((r) => r.esercizio),
    ...predefinito(esercizi.map((r) => r.esercizio)),
  };
  const r = fine.riassunto ?? {};
  const riassunto = riassumi(
    esercizi.map((e) => ({
      formato: e.formato,
      superato: e.superato,
      token_al_secondo: e.token_al_secondo,
      primo_token_ms: e.primo_token_ms,
      totale_ms: e.totale_ms,
      token_uscita: e.token_uscita,
      token_ragionamento: e.token_ragionamento,
      wh: e.wh,
      finish_reason: e.finish_reason,
      ragionamento_visto: e.ragionamento_visto,
      errore_api: e.errore_api,
    })),
    {
      modello: fine.modello,
      data: fine.data,
      riposo_w: r.riposo_w ?? null,
      prompt_token_al_secondo: r.prompt_token_al_secondo ?? null,
      prompt_token: r.prompt_token ?? null,
      completo: r.completo ?? false,
      note: r.note ?? "",
    },
  );
  return {
    modello: fine.modello,
    data: fine.data,
    locale: fine.avvio?.tipo !== "api",
    confronto,
    chiave: chiaveConfronto(confronto),
    riassunto,
    esiti: Object.fromEntries(esercizi.map((e) => [e.esercizio, e.superato === true])),
    costo_usd: costoEsecuzione(righe.filter((x) => x.tipo === "prompt_lungo" || x.tipo === "esercizio").map((x) => x.usage)),
  };
}

// Per ogni modello l'esecuzione più recente (le date "2026-11-22T20-30-05" si ordinano come stringhe).
export function ultimaPerModello(esecuzioni: Esecuzione[]): Esecuzione[] {
  const ultime = new Map<string, Esecuzione>();
  for (const e of esecuzioni) {
    const prima = ultime.get(e.modello);
    if (!prima || e.data > prima.data) ultime.set(e.modello, e);
  }
  return [...ultime.values()];
}

// Crescente con i null in fondo.
const crescente = (a: number | null, b: number | null) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : a - b);

// Locali: più superati, poi tempo medio più basso.
export function classificaLocali(esecuzioni: Esecuzione[]): Esecuzione[] {
  return [...esecuzioni].sort(
    (a, b) =>
      b.riassunto.superati - a.riassunto.superati ||
      crescente(a.riassunto.media_totale_s, b.riassunto.media_totale_s) ||
      a.modello.localeCompare(b.modello),
  );
}

// API: più superati, poi costo per superato più basso ("–" in fondo).
export function classificaApi(esecuzioni: Esecuzione[]): Esecuzione[] {
  return [...esecuzioni].sort(
    (a, b) =>
      b.riassunto.superati - a.riassunto.superati ||
      crescente(costoPerSuperato(a.costo_usd, a.riassunto.superati), costoPerSuperato(b.costo_usd, b.riassunto.superati)) ||
      a.modello.localeCompare(b.modello),
  );
}

// Numero con la virgola decimale; "–" se manca.
export function formato(n: number | null | undefined, decimali: number): string {
  return n == null || Number.isNaN(n) ? "–" : n.toFixed(decimali).replace(".", ",");
}

const INTESTAZIONE_LOCALI =
  "| Modello | Data | Superati | Codice | Non codice | tok/s medi | Primo token medio (s) | Tempo medio (s) | Token uscita medi | Wh totali | Wh medi | Riposo (W) | Prompt tok/s (token) | Ragiona | Troncati | Note |";
const INTESTAZIONE_API =
  "| Modello | Data | Superati | Codice | Non codice | Troncati | Token uscita medi | Token ragionamento medi | Tempo medio (s) | Costo totale ($) | Costo per superato ($) | Note |";

const superati = (e: Esecuzione) =>
  `${e.riassunto.superati}/${e.confronto.esercizi.length}${e.riassunto.completo ? "" : " (incompleto)"}`;
// Esercizi previsti di una categoria; i nomi senza formato nel confronto sono di codice.
const previsti = (c: Confronto, cat: Categoria) => c.esercizi.filter((n) => categoria(c.formati?.[n]) === cat);
const perCategoria = (e: Esecuzione, cat: Categoria) => {
  const n = previsti(e.confronto, cat).length;
  return n ? `${cat === "codice" ? e.riassunto.superati_codice : e.riassunto.superati_non_codice}/${n}` : "–";
};
const categorie = (e: Esecuzione) => [perCategoria(e, "codice"), perCategoria(e, "non codice")];
const note = (r: Riassunto) =>
  [r.errori_api ? `errori API: ${r.errori_api}` : "", r.note].filter(Boolean).join("; ").replace(/\|/g, "/").replace(/\s*\n\s*/g, " ");
const riga = (celle: string[]) => `| ${celle.join(" | ")} |`;

export function rigaLocale(e: Esecuzione): string {
  const r = e.riassunto;
  return riga([
    e.modello,
    e.data,
    superati(e),
    ...categorie(e),
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
    note(r),
  ]);
}

export function rigaApi(e: Esecuzione): string {
  const r = e.riassunto;
  return riga([
    e.modello,
    e.data,
    superati(e),
    ...categorie(e),
    String(r.troncati),
    formato(r.media_token_uscita, 0),
    formato(r.media_token_ragionamento, 0),
    formato(r.media_totale_s, 1),
    formato(e.costo_usd, 4),
    formato(costoPerSuperato(e.costo_usd, r.superati), 5),
    note(r),
  ]);
}

// Esito di ogni esercizio previsto, con gli esercizi raggruppati per categoria:
// ✓ superato, ✗ fallito, – non eseguito (esecuzione incompleta o fermata).
export function tabellaEsiti(esecuzioni: Esecuzione[], c: Confronto): string {
  const gruppi = (["codice", "non codice"] as const)
    .map((cat) => ({ cat, titolo: cat === "codice" ? "Codice" : "Non codice", nomi: previsti(c, cat) }))
    .filter((g) => g.nomi.length);
  const intestazione = ["Modello", ...gruppi.flatMap((g) => [g.titolo, ...g.nomi.map((n) => n.slice(0, 2))])];
  const righe = esecuzioni.map((e) =>
    riga([
      e.modello,
      ...gruppi.flatMap((g) => [perCategoria(e, g.cat), ...g.nomi.map((n) => (n in e.esiti ? (e.esiti[n] ? "✓" : "✗") : "–"))]),
    ]),
  );
  const legenda = gruppi
    .map((g) => `${g.titolo}: ${g.nomi.map((n) => `${n.slice(0, 2)} ${n.slice(3)}${g.cat === "codice" ? "" : ` (${c.formati?.[n]})`}`).join(", ")}.`)
    .join(" ");
  return [`✓ superato, ✗ fallito, – non eseguito. ${legenda}\n`, [riga(intestazione), "|" + "---|".repeat(intestazione.length), ...righe].join("\n") + "\n"].join("\n");
}

// Le due tabelle; con `ancheVuote` falso una tabella senza righe non compare.
function tabelle(esecuzioni: Esecuzione[], titolo: string, ancheVuote: boolean): string[] {
  const locali = classificaLocali(esecuzioni.filter((e) => e.locale));
  const api = classificaApi(esecuzioni.filter((e) => !e.locale));
  const parti: string[] = [];
  const tabella = (nome: string, intestazione: string, righe: string[]) => {
    if (!righe.length && !ancheVuote) return;
    const colonne = intestazione.split("|").length - 2;
    parti.push(`${titolo} ${nome}\n`, righe.length ? [intestazione, "|" + "---|".repeat(colonne), ...righe].join("\n") + "\n" : "Nessuna esecuzione.\n");
  };
  tabella("Modelli locali", INTESTAZIONE_LOCALI, locali.map(rigaLocale));
  tabella("Modelli via API", INTESTAZIONE_API, api.map(rigaApi));
  return parti;
}

const INTRO = `# Riepilogo del banco

Generato dai file \`risultati/*.jsonl\` con \`npm run bench:riepilogo\` (e a ogni \`npm run bench\`): non modificare a mano.
Il dettaglio (ogni chiamata, hardware, parametri) è nei file \`risultati/<data>-<modello>.jsonl\`.

Una riga per modello: la sua ultima esecuzione con l'impronta di confronto (parametri di chiamata, esercizi, versione del prompt).
Le esecuzioni con un'impronta diversa da quella corrente sono in fondo, separate.

- tok/s medi: media sugli esercizi di token in uscita / (tempo totale − tempo al primo token).
- Primo token: primo frammento in streaming, ragionamento compreso.
- Wh: energia della sola GPU (nvidia-smi ogni 500 ms), integrata sulla durata di ogni chiamata; il riposo non è sottratto.
- Prompt tok/s: token in ingresso / tempo al primo token su un prompt lungo (max_tokens 1).
- Superati: totale; Codice e Non codice sono gli stessi superati divisi per categoria (formato codice, oppure json e testo). Le classifiche seguono il totale. Il dettaglio di ogni esercizio è in "Esiti per esercizio".
- Troncati: risposte con finish_reason "length".
- Costo: somma di \`usage.cost\` riportato dall'API su tutte le chiamate del run (prompt lungo compreso); "–" se l'API non lo riporta, mai stimato. Costo per superato = costo totale / esercizi superati.
`;

// Il riepilogo intero: prima l'impronta corrente (locali e API), poi le altre dalla più recente.
export function componiRiepilogo(esecuzioni: Esecuzione[], corrente: Confronto): string {
  const chiave = chiaveConfronto(corrente);
  const gruppi = new Map<string, Esecuzione[]>();
  for (const e of esecuzioni) gruppi.set(e.chiave, [...(gruppi.get(e.chiave) ?? []), e]);
  const parti = [INTRO, `## Impronta corrente\n`, `${descriviConfronto(corrente)} (chiave ${chiave})\n`];
  const correnti = ultimaPerModello(gruppi.get(chiave) ?? []);
  parti.push(...tabelle(correnti, "###", true));
  if (correnti.length) {
    const ordinate = [...classificaLocali(correnti.filter((e) => e.locale)), ...classificaApi(correnti.filter((e) => !e.locale))];
    parti.push(`### Esiti per esercizio\n`, tabellaEsiti(ordinate, corrente));
  }
  const piuRecente = (es: Esecuzione[]) => es.map((e) => e.data).sort().at(-1)!;
  const altre = [...gruppi.entries()]
    .filter(([k]) => k !== chiave)
    .map(([, es]) => ultimaPerModello(es))
    .sort((a, b) => piuRecente(b).localeCompare(piuRecente(a)));
  if (altre.length) {
    parti.push(`## Altre impronte\n`, "Esecuzioni non confrontabili con quelle sopra.\n");
    for (const es of altre) {
      parti.push(`### ${descriviConfronto(es[0].confronto)} (chiave ${es[0].chiave})\n`);
      parti.push(...tabelle(es, "####", false));
    }
  }
  return parti.join("\n");
}
