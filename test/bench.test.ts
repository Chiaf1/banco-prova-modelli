import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aggiornaRiepilogo,
  confrontaHardware,
  dataEsecuzione,
  estraiCodice,
  formato,
  impronta,
  leggiDataNvidia,
  leggiTap,
  media,
  nomeFile,
  potenzaMedia,
  potenzaStabile,
  riassumi,
  rigaRiepilogo,
  tokenAlSecondo,
  tokenPromptAlSecondo,
  whIntegrati,
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
  vicino(r.wh_totali, 0.04);
  vicino(r.media_wh, 0.02);
  assert.equal(r.troncati, 1);
  assert.equal(r.errori_api, 1);
  assert.equal(r.ragiona, "in parte");
});

test("rigaRiepilogo e aggiornaRiepilogo: sostituisce la riga dello stesso modello", () => {
  const r1 = rigaRiepilogo(riassumi([riga({})], { ...extra, modello: "a" }));
  const r2 = rigaRiepilogo(riassumi([riga({})], { ...extra, modello: "b", completo: false }));
  assert.match(r1, /^\| a \| 2026-11-22T10-00-00 \| 1\/1 \| 10,0 \| 1,00 \| 5,0 \| 40 \| 0,010 \| 0,0100 \| 12,3 \| 1500 \(4012\) \| sì \| 0 \|  \|$/);
  assert.match(r2, /\| 1\/1 \(incompleto\) \|/);
  let testo = aggiornaRiepilogo(null, "a", r1);
  testo = aggiornaRiepilogo(testo, "b", r2);
  const r1nuova = r1.replace("10,0", "99,0");
  testo = aggiornaRiepilogo(testo, "a", r1nuova);
  const righe = testo.split("\n").filter((l) => /^\| [ab] \|/.test(l));
  assert.deepEqual(righe, [r1nuova, r2]);
  assert.equal(testo.split("\n").filter((l) => l.startsWith("| Modello")).length, 1);
});
