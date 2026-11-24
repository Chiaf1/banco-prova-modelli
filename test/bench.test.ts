import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chiaveConfronto,
  classificaApi,
  classificaLocali,
  componiRiepilogo,
  confrontaHardware,
  costoEsecuzione,
  descriviConfronto,
  costoPerSuperato,
  dataEsecuzione,
  estraiCodice,
  formato,
  impronta,
  leggiDataNvidia,
  leggiEsecuzione,
  leggiTap,
  media,
  nomeFile,
  potenzaMedia,
  potenzaStabile,
  riassumi,
  rigaApi,
  rigaLocale,
  tokenAlSecondo,
  ultimaPerModello,
  tokenPromptAlSecondo,
  whIntegrati,
  type Confronto,
  type Esecuzione,
  type RigaEsercizio,
} from "../bench/calcoli.ts";
import { leggiSse } from "../bench/api.ts";

const vicino = (a: number | null, b: number, eps = 1e-9) =>
  assert.ok(a != null && Math.abs(a - b) < eps, `${a} non è circa ${b}`);

// ---- estrazione del codice ----

test("estraiCodice: blocco ts", () => {
  assert.equal(estraiCodice("Ecco:\n```ts\nexport const a = 1;\n```\nfine"), "export const a = 1;\n");
});

test("estraiCodice: blocco typescript e maiuscole", () => {
  assert.equal(estraiCodice("```TypeScript\nlet x = 2;\n```"), "let x = 2;\n");
});

test("estraiCodice: prende il primo blocco ts e salta gli altri linguaggi", () => {
  const t = "```js\nnope()\n```\n```ts\nprimo\n```\n```ts\nsecondo\n```";
  assert.equal(estraiCodice(t), "primo\n");
});

test("estraiCodice: non confonde tsx", () => {
  assert.equal(estraiCodice("```tsx\n<a/>\n```"), null);
});

test("estraiCodice: blocco non chiuso o assente", () => {
  assert.equal(estraiCodice("```ts\nexport function f() {"), null);
  assert.equal(estraiCodice("niente codice"), null);
});

test("estraiCodice: attributi dopo il linguaggio e CRLF", () => {
  assert.equal(estraiCodice('```ts title="a.ts"\r\nconst a = 1;\r\n```'), "const a = 1;\r\n");
});

// ---- medie e token/s ----

test("media: ignora null e NaN", () => {
  assert.equal(media([1, 2, 3, null, undefined, NaN]), 2);
  assert.equal(media([]), null);
  assert.equal(media([null]), null);
});

test("tokenAlSecondo: token / (totale − primo token)", () => {
  vicino(tokenAlSecondo(500, 12_000, 2_000), 50);
  assert.equal(tokenAlSecondo(10, 1000, 1000), null);
  assert.equal(tokenAlSecondo(null, 1000, 100), null);
});

test("tokenPromptAlSecondo: token in ingresso / primo token", () => {
  vicino(tokenPromptAlSecondo(4000, 2_500), 1600);
  assert.equal(tokenPromptAlSecondo(4000, 0), null);
});

// ---- energia ----

test("whIntegrati: potenza costante", () => {
  const c = [0, 500, 1000, 1500, 2000].map((t) => ({ t, w: 100 }));
  vicino(whIntegrati(c, 0, 2000), (100 * 2) / 3600); // 100 W per 2 s
});

test("whIntegrati: rampa lineare e estremi interpolati", () => {
  const c = [
    { t: 0, w: 0 },
    { t: 1000, w: 100 },
  ];
  // da 250 ms (25 W) a 750 ms (75 W): media 50 W per 0,5 s
  vicino(whIntegrati(c, 250, 750), (50 * 0.5) / 3600);
});

test("whIntegrati: fuori dai campioni oltre il margine dà null", () => {
  const c = [
    { t: 1000, w: 50 },
    { t: 1500, w: 50 },
  ];
  assert.equal(whIntegrati(c, -100, 1500), null); // 1100 ms prima del primo campione
  vicino(whIntegrati(c, 500, 1500), (50 * 1) / 3600); // 500 ms di margine: valore del primo campione
  assert.equal(whIntegrati([], 0, 10), null);
  assert.equal(whIntegrati(c, 10, 10), null);
});

test("whIntegrati: campioni disordinati", () => {
  const c = [
    { t: 1000, w: 20 },
    { t: 0, w: 20 },
    { t: 500, w: 20 },
  ];
  vicino(whIntegrati(c, 0, 1000), 20 / 3600);
});

test("potenzaMedia", () => {
  const c = [
    { t: 0, w: 10 },
    { t: 1000, w: 30 },
  ];
  vicino(potenzaMedia(c, 0, 1000), 20);
});

test("potenzaStabile: smette di scendere", () => {
  assert.equal(potenzaStabile([]), false);
  assert.equal(potenzaStabile([40]), false);
  assert.equal(potenzaStabile([40, 20]), false); // sta ancora scendendo
  assert.equal(potenzaStabile([40, 20, 19.5]), true);
  assert.equal(potenzaStabile([7, 8]), true);
  assert.equal(potenzaStabile([7, null]), false);
});

test("leggiDataNvidia: ora locale con millisecondi", () => {
  assert.equal(leggiDataNvidia("2026/11/22 20:30:11.696"), new Date(2026, 10, 22, 20, 30, 11, 696).getTime());
  assert.ok(Number.isNaN(leggiDataNvidia("boh")));
});

// ---- varie ----

test("leggiTap", () => {
  assert.deepEqual(leggiTap("ok 1\n# tests 3\n# pass 2\n# fail 1\n"), { pass: 2, fail: 1 });
  assert.deepEqual(leggiTap(""), { pass: null, fail: null });
});

test("impronta: non dipende dall'ordine delle chiavi", () => {
  assert.equal(impronta({ a: 1, b: { c: 2, d: [1, 2] } }), impronta({ b: { d: [1, 2], c: 2 }, a: 1 }));
  assert.notEqual(impronta({ a: 1 }), impronta({ a: 2 }));
});

test("confrontaHardware", () => {
  const note = "AMD Ryzen 7 7800X3D | NVIDIA GeForce RTX 2080, 8192 MiB | 620.70.06 | 7.3.4 | 0.40.16 | build 12607";
  const hw = {
    cpu: "AMD Ryzen 7 7800X3D 8-Core Processor",
    gpu: "NVIDIA GeForce RTX 2080",
    vram_mib: 8192,
    driver: "620.70.06",
    kernel: "7.3.4",
    ollama: "0.40.17",
    llama_build: null,
  };
  assert.deepEqual(confrontaHardware(hw, note), [
    'ollama: "0.40.17" non è in note/hardware.md',
    "llama.cpp build: non rilevato",
  ]);
});

test("dataEsecuzione e nomeFile", () => {
  assert.equal(dataEsecuzione(new Date(2026, 10, 2, 9, 5, 7)), "2026-11-02T09-05-07");
  assert.equal(nomeFile("qwen3.5:4b"), "qwen3.5_4b");
});

test("formato: virgola decimale e trattino", () => {
  assert.equal(formato(1.25, 1), "1,3");
  assert.equal(formato(null, 1), "–");
});

// ---- streaming ----

test("leggiSse: righe data spezzate tra pezzi", () => {
  const eventi: string[] = [];
  let resto = leggiSse('data: {"a":1}\n\ndata: {"b"', (d) => eventi.push(d));
  resto = leggiSse(resto + ':2}\n\n: commento\ndata: [DONE]\n\n', (d) => eventi.push(d));
  assert.deepEqual(eventi, ['{"a":1}', '{"b":2}', "[DONE]"]);
  assert.equal(resto, "");
});

// ---- riepilogo ----

const riga = (o: Partial<RigaEsercizio>): RigaEsercizio => ({
  superato: true,
  token_al_secondo: 10,
  primo_token_ms: 1000,
  totale_ms: 5000,
  token_uscita: 40,
  wh: 0.01,
  finish_reason: "stop",
  ragionamento_visto: true,
  errore_api: null,
  ...o,
});

const extra = {
  modello: "m",
  data: "2026-11-22T10-00-00",
  riposo_w: 12.34,
  prompt_token_al_secondo: 1500,
  prompt_token: 4012,
  completo: true,
  note: "",
};

test("riassumi: medie, somme e conteggi", () => {
  const r = riassumi(
    [
      riga({}),
      riga({ superato: false, token_al_secondo: 30, primo_token_ms: 3000, totale_ms: 7000, token_uscita: 80, wh: 0.03, finish_reason: "length", ragionamento_visto: false }),
      riga({ superato: false, token_al_secondo: null, primo_token_ms: null, totale_ms: null, token_uscita: null, wh: null, errore_api: "HTTP 500" }),
    ],
    extra,
  );
  assert.equal(r.esercizi, 3);
  assert.equal(r.superati, 1);
  vicino(r.media_token_al_secondo, 20);
  vicino(r.media_primo_token_s, 2);
  vicino(r.media_totale_s, 6);
  vicino(r.media_token_uscita, 60);
  assert.equal(r.media_token_ragionamento, null);
  vicino(r.wh_totali, 0.04);
  vicino(r.media_wh, 0.02);
  assert.equal(r.troncati, 1);
  assert.equal(r.errori_api, 1);
  assert.equal(r.ragiona, "in parte");
});

test("riassumi: token di ragionamento medi ignorano i null", () => {
  const r = riassumi([riga({ token_ragionamento: 100 }), riga({ token_ragionamento: null }), riga({ token_ragionamento: 300 })], extra);
  vicino(r.media_token_ragionamento, 200);
});

// ---- costo ----

test("costoEsecuzione: somma usage.cost", () => {
  vicino(costoEsecuzione([{ cost: 0.0005794 }, { cost: 0.00007405 }, { cost: 0.00006508 }]), 0.00071853);
});

test("costoEsecuzione: chiamate senza usage non entrano, costo a zero sì", () => {
  vicino(costoEsecuzione([null, { cost: 0.001 }, undefined, { cost: 0 }]), 0.001);
});

test("costoEsecuzione: senza cost in un usage (es. Gemini) è null, mai stimato", () => {
  assert.equal(costoEsecuzione([{ prompt_tokens: 250, completion_tokens: 870 }]), null);
  assert.equal(costoEsecuzione([{ cost: 0.001 }, { prompt_tokens: 250 }]), null);
  assert.equal(costoEsecuzione([{ cost: "0.001" }]), null);
  assert.equal(costoEsecuzione([]), null);
  assert.equal(costoEsecuzione([null, null]), null);
});

test("costoPerSuperato", () => {
  vicino(costoPerSuperato(0.009, 9), 0.001);
  assert.equal(costoPerSuperato(0.009, 0), null);
  assert.equal(costoPerSuperato(null, 9), null);
});

// ---- riepilogo ----

const confronto = (o: Partial<Confronto> = {}): Confronto => ({
  parametri: { temperature: 0, max_tokens: 8192, reasoning_effort: "medium" },
  esercizi: ["01-a", "02-b"],
  versione_prompt: 1,
  impronta_esercizi: "abc",
  ...o,
});

test("chiaveConfronto: cambia con max_tokens o esercizi, non con l'ordine delle chiavi", () => {
  const k = chiaveConfronto(confronto());
  assert.equal(chiaveConfronto({ impronta_esercizi: "abc", versione_prompt: 1, esercizi: ["01-a", "02-b"], parametri: { reasoning_effort: "medium", max_tokens: 8192, temperature: 0 } }), k);
  assert.notEqual(chiaveConfronto(confronto({ parametri: { temperature: 0, max_tokens: 16384, reasoning_effort: "medium" } })), k);
  assert.notEqual(chiaveConfronto(confronto({ esercizi: ["01-a"] })), k);
  assert.notEqual(chiaveConfronto(confronto({ versione_prompt: 2 })), k);
});

test("descriviConfronto: uno o più esercizi", () => {
  assert.equal(descriviConfronto(confronto()), "temperature 0, max_tokens 8192, reasoning_effort medium; 2 esercizi (01-a … 02-b); prompt v1");
  assert.equal(descriviConfronto(confronto({ esercizi: ["01-a"] })), "temperature 0, max_tokens 8192, reasoning_effort medium; 1 esercizio (01-a); prompt v1");
});

// Righe .jsonl minime, come le scrive il banco.
const jsonl = (o: { modello?: string; data?: string; tipo?: string; costi?: (number | null | undefined)[]; confronto?: Confronto; superati?: boolean[] } = {}) => {
  const comune = { modello: o.modello ?? "m", data: o.data ?? "2026-11-24T20-00-00", avvio: { tipo: o.tipo ?? "api" }, parametri_chiamata: confronto().parametri, ...(o.confronto ? { confronto: o.confronto } : {}) };
  const usage = (c: number | null | undefined) => (c === undefined ? { prompt_tokens: 1 } : c === null ? null : { cost: c });
  const costi = o.costi ?? [0.5, 0.25, 0.25];
  const sup = o.superati ?? [true, false];
  return [
    { tipo: "prompt_lungo", usage: usage(costi[0]), ...comune },
    ...sup.map((s, i) => ({ tipo: "esercizio", esercizio: ["01-a", "02-b"][i], ...riga({ superato: s, token_ragionamento: 10 * (i + 1) }), usage: usage(costi[i + 1]), ...comune })),
    { tipo: "fine", riassunto: { riposo_w: null, prompt_token_al_secondo: 4000, prompt_token: 4800, completo: true, note: "nota" }, ...comune },
  ];
};
// undefined: usage senza cost (come Gemini); null: chiamata senza usage.
const SENZA_COST = [undefined, undefined, undefined];
const predefinito = () => ({ versione_prompt: 1, impronta_esercizi: "abc" });

test("leggiEsecuzione: ricalcola dai .jsonl, costo dal prompt lungo e dagli esercizi", () => {
  const e = leggiEsecuzione(jsonl(), predefinito)!;
  assert.equal(e.modello, "m");
  assert.equal(e.locale, false);
  assert.equal(e.riassunto.superati, 1);
  assert.equal(e.riassunto.esercizi, 2);
  vicino(e.riassunto.media_token_ragionamento, 15);
  vicino(e.costo_usd, 1);
  assert.equal(e.riassunto.note, "nota");
  assert.deepEqual(e.confronto, confronto()); // file vecchio: ricavato da parametri, righe e predefinito
  assert.equal(e.chiave, chiaveConfronto(confronto()));
});

test("leggiEsecuzione: usa il campo confronto se c'è; senza fine o esercizi è null", () => {
  const c = confronto({ esercizi: ["01-a", "02-b", "03-c"] });
  assert.deepEqual(leggiEsecuzione(jsonl({ confronto: c }), predefinito)!.confronto, c);
  assert.equal(leggiEsecuzione(jsonl().filter((r) => r.tipo !== "fine"), predefinito), null);
  assert.equal(leggiEsecuzione(jsonl().filter((r) => r.tipo !== "esercizio"), predefinito), null);
  assert.equal(leggiEsecuzione(jsonl({ tipo: "ollama", costi: [null, null, null] }), predefinito)!.locale, true);
});

test("leggiEsecuzione: senza usage.cost il costo è null", () => {
  assert.equal(leggiEsecuzione(jsonl({ costi: SENZA_COST }), predefinito)!.costo_usd, null);
});

const esec = (o: Parameters<typeof jsonl>[0]) => leggiEsecuzione(jsonl(o), predefinito)!;

test("ultimaPerModello: vale la data più recente", () => {
  const u = ultimaPerModello([esec({ modello: "a", data: "2026-11-24T10-00-00" }), esec({ modello: "a", data: "2026-11-24T11-00-00" }), esec({ modello: "b" })]);
  assert.deepEqual(u.map((e) => `${e.modello} ${e.data}`).sort(), ["a 2026-11-24T11-00-00", "b 2026-11-24T20-00-00"]);
});

test("classificaApi: superati, poi costo per superato, '–' in fondo", () => {
  const es = [
    esec({ modello: "caro", costi: [1, 1, 1] }),
    esec({ modello: "senza", costi: SENZA_COST }),
    esec({ modello: "economico", costi: [0.1, 0.1, 0.1] }),
    esec({ modello: "bravo", costi: [9, 9, 9], superati: [true, true] }),
  ];
  assert.deepEqual(classificaApi(es).map((e) => e.modello), ["bravo", "economico", "caro", "senza"]);
});

test("classificaLocali: superati, poi tempo medio", () => {
  const lento = jsonl({ modello: "lento", tipo: "ollama" }).map((r) => (r.tipo === "esercizio" ? { ...r, totale_ms: 9000 } : r));
  const es = [leggiEsecuzione(lento, predefinito)!, esec({ modello: "veloce", tipo: "ollama" }), esec({ modello: "bravo", tipo: "ollama", superati: [true, true] })];
  assert.deepEqual(classificaLocali(es).map((e) => e.modello), ["bravo", "veloce", "lento"]);
});

test("rigaLocale e rigaApi: celle e formati", () => {
  const l = esec({ tipo: "llamacpp", superati: [true, true] });
  assert.equal(rigaLocale(l), "| m | 2026-11-24T20-00-00 | 2/2 | 10,0 | 1,00 | 5,0 | 40 | 0,020 | 0,0100 | – | 4000 (4800) | sì | 0 | nota |");
  const a = esec({ costi: [0.0005794, 0.00007405, 0.00006508] });
  assert.equal(rigaApi(a), "| m | 2026-11-24T20-00-00 | 1/2 | 0 | 40 | 15 | 5,0 | 0,0007 | 0,00072 | nota |");
  const inc = jsonl().map((r) => (r.tipo === "fine" ? { ...r, riassunto: { ...r.riassunto, completo: false } } : r));
  assert.match(rigaApi(leggiEsecuzione(inc, predefinito)!), /\| 1\/2 \(incompleto\) \|/);
});

test("componiRiepilogo: due tabelle per l'impronta corrente, le altre separate e non sovrascritte", () => {
  const altra = confronto({ esercizi: ["01-a"] });
  const testo = componiRiepilogo(
    [
      esec({ modello: "loc", tipo: "ollama" }),
      esec({ modello: "api1" }),
      esec({ modello: "api1", data: "2026-11-25T08-00-00", confronto: altra }), // più recente ma con un'altra impronta
    ],
    confronto(),
  );
  const [corrente, altre] = testo.split("## Altre impronte");
  assert.match(corrente, /### Modelli locali\n\n\| Modello \| Data \| Superati \| tok\/s medi/);
  assert.match(corrente, /### Modelli via API\n\n\| Modello \| Data \| Superati \| Troncati \| Token uscita medi \| Token ragionamento medi/);
  assert.match(corrente, /^\| loc \|/m);
  assert.match(corrente, /^\| api1 \| 2026-11-24T20-00-00 \|/m);
  assert.doesNotMatch(corrente, /2026-11-25/);
  assert.match(altre, /### .*1 esercizio .*\n\n#### Modelli via API\n\n.*\n.*\n\| api1 \| 2026-11-25T08-00-00 \|/);
  assert.doesNotMatch(altre, /Modelli locali/); // in un'altra impronta le tabelle vuote non compaiono
});

test("componiRiepilogo: senza esecuzioni né altre impronte", () => {
  const testo = componiRiepilogo([], confronto());
  assert.equal(testo.split("Nessuna esecuzione.").length, 3);
  assert.doesNotMatch(testo, /Altre impronte/);
});
