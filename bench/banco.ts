// Banco: fa risolvere gli esercizi a un modello e misura velocità, token, energia della GPU e accuratezza.
// Uso: npm run bench -- --model <nome> [--esercizi N] [--ripetizioni N] [--pausa S] [--forza]
//      npm run bench -- --tutti [--esercizi N] [--ripetizioni N] [--forza]
// Con --ripetizioni N ogni modello fa N giri, ognuno con il suo .jsonl e la stessa `serie`.
import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { chiamata, type EsitoChiamata, type ParametriChiamata } from "./api.ts";
import {
  confrontaHardware,
  dataEsecuzione,
  ESTENSIONE,
  estraiRisposta,
  LINGUAGGIO,
  impronta,
  nomeFile,
  potenzaMedia,
  potenzaStabile,
  riassumi,
  rigaApi,
  rigaLocale,
  tokenAlSecondo,
  tokenPromptAlSecondo,
  whIntegrati,
  type RigaEsercizio,
  type Serie,
} from "./calcoli.ts";
import { avviaMisuratore, CAMPO_POTENZA, INTERVALLO_MS, type Misuratore } from "./energia.ts";
import { elencaEsercizi, eseguiTest, improntaEsercizi } from "./esegui.ts";
import { promptEsercizio, testoLungo, VERSIONE_PROMPT } from "./prompt.ts";
import { rigeneraRiepilogo } from "./riepilogo.ts";
import {
  ambienteOllama,
  ollamaCaricati,
  propsLlama,
  rilevaHardware,
  scaricaOllama,
  serverRisponde,
  versioneProgramma,
} from "./sistema.ts";

const RADICE = resolve(import.meta.dirname, "..");
const RISULTATI = join(RADICE, "risultati");
const RIPOSO_MS = 5000; // una finestra di misura del riposo
const RIPOSO_FINESTRE_MAX = 12; // al massimo 60 s di attesa che la GPU scenda di consumo

type ConfModello = {
  tipo: "ollama" | "llamacpp" | "api";
  url: string;
  id: string;
  contesto?: number;
  avvio: string;
  note?: string;
  chiave_env?: string;
  pausa_s?: number;
  tetto_chiamate?: number;
};
type Config = {
  parametri_chiamata: ParametriChiamata;
  prompt_lungo: { parole: number; seme: number };
  modelli: Record<string, ConfModello>;
};

class Fermata extends Error {}

const { values: arg } = parseArgs({
  options: {
    model: { type: "string" },
    tutti: { type: "boolean", default: false },
    esercizi: { type: "string" },
    pausa: { type: "string" },
    ripetizioni: { type: "string" },
    forza: { type: "boolean", default: false },
  },
});

const config: Config = JSON.parse(
  readFileSync(process.env.BENCH_MODELLI ?? join(import.meta.dirname, "modelli.json"), "utf8"),
);

function esci(messaggio: string): never {
  console.error(messaggio);
  process.exit(1);
}

const nomi = arg.tutti ? Object.keys(config.modelli) : arg.model ? [arg.model] : [];
if (nomi.length === 0) esci("Uso: npm run bench -- --model <nome> [--esercizi N] [--ripetizioni N] [--pausa S] [--forza] | --tutti");
for (const n of nomi) {
  if (!config.modelli[n]) esci(`Modello "${n}" non è in bench/modelli.json. Disponibili: ${Object.keys(config.modelli).join(", ")}`);
}
const tuttiEsercizi = elencaEsercizi();
const quanti = arg.esercizi ? Number(arg.esercizi) : tuttiEsercizi.length;
if (!Number.isInteger(quanti) || quanti < 1 || quanti > tuttiEsercizi.length) {
  esci(`--esercizi deve essere un intero tra 1 e ${tuttiEsercizi.length}`);
}
const esercizi = tuttiEsercizi.slice(0, quanti);
if (arg.pausa != null && !(Number(arg.pausa) >= 0)) esci("--pausa deve essere un numero di secondi ≥ 0");
const ripetizioni = arg.ripetizioni ? Number(arg.ripetizioni) : 1;
if (!Number.isInteger(ripetizioni) || ripetizioni < 1) esci("--ripetizioni deve essere un intero ≥ 1");

// Esecuzione completa già presente con la stessa impronta?
function giaEseguito(modello: string, imp: string): string | null {
  if (!existsSync(RISULTATI)) return null;
  for (const f of readdirSync(RISULTATI).filter((f) => f.endsWith(".jsonl")).sort().reverse()) {
    for (const riga of readFileSync(join(RISULTATI, f), "utf8").split("\n")) {
      if (!riga.includes('"tipo":"fine"')) continue;
      const r = JSON.parse(riga);
      if (r.modello === modello && r.impronta === imp && r.riassunto?.completo) return f;
    }
  }
  return null;
}

const attendi = (ms: number) => new Promise((r) => setTimeout(r, ms));
const s = (ms: number | null) => (ms == null ? "–" : (ms / 1000).toFixed(2));
const n1 = (x: number | null) => (x == null ? "–" : x.toFixed(1));

// Un giro di un modello. `serie` è null con un solo giro. Restituisce true se il giro è stato interrotto.
async function eseguiModello(nome: string, serie: Serie | null): Promise<boolean> {
  const conf = config.modelli[nome];
  const locale = conf.tipo !== "api";
  const ambiente = conf.tipo === "ollama" ? ambienteOllama() : null;
  const { note: _note, ...confSenzaNote } = conf;
  const imp = impronta({
    modello: confSenzaNote,
    ambiente_ollama: ambiente,
    parametri: config.parametri_chiamata,
    prompt: VERSIONE_PROMPT,
    prompt_lungo: config.prompt_lungo,
    esercizi: improntaEsercizi(esercizi),
  });
  // Con più giri si chiede esplicitamente di rifare: niente salto.
  const gia = serie ? null : giaEseguito(nome, imp);
  if (gia && !arg.forza) {
    console.log(`= ${nome}: già eseguito con le stesse impostazioni (risultati/${gia}), salto. Usa --forza per rifarlo.`);
    return false;
  }

  // ---- preparazione: un modello alla volta ----
  let chiave: string | undefined;
  if (conf.tipo === "api") {
    chiave = process.env[conf.chiave_env ?? ""];
    if (!chiave) throw new Fermata(`${nome}: manca ${conf.chiave_env} (in .env, caricato con --env-file-if-exists)`);
  } else {
    const llamaAccesi = Object.entries(config.modelli).filter(([, c]) => c.tipo === "llamacpp" && c.url !== conf.url);
    if (conf.tipo === "ollama") {
      for (const [n, c] of llamaAccesi) {
        if (await serverRisponde(c.url)) throw new Fermata(`${nome}: il server llama.cpp di ${n} (${c.url}) è acceso e occupa la GPU: spegnilo prima.`);
      }
    }
    const scaricati = await scaricaOllama();
    if (scaricati.length) console.log(`  scaricati da Ollama: ${scaricati.join(", ")}`);
    if (conf.tipo === "llamacpp") {
      if ((await ollamaCaricati().catch(() => [])).length) throw new Fermata(`${nome}: Ollama ha ancora modelli in GPU.`);
      if (!(await serverRisponde(conf.url))) throw new Fermata(`${nome}: il server non risponde su ${conf.url}. Avvialo con:\n  ${conf.avvio}`);
    }
  }

  // Due giri nello stesso secondo darebbero lo stesso file: si aspetta il secondo dopo.
  let data = dataEsecuzione(new Date());
  while (existsSync(join(RISULTATI, `${data}-${nomeFile(nome)}.jsonl`))) {
    await attendi(1000);
    data = dataEsecuzione(new Date());
  }
  const fileJsonl = join(RISULTATI, `${data}-${nomeFile(nome)}.jsonl`);
  const cartellaRisposte = join(RISULTATI, "codice", `${data}-${nomeFile(nome)}`);
  mkdirSync(cartellaRisposte, { recursive: true });

  const hardware = rilevaHardware();
  const differenze = confrontaHardware(hardware, readFileSync(join(RADICE, "note", "hardware.md"), "utf8"));
  for (const d of differenze) console.warn(`  ! hardware diverso da note/hardware.md: ${d}`);

  const pausaMs = 1000 * Number(arg.pausa ?? conf.pausa_s ?? 0);
  const tetto = conf.tetto_chiamate ?? Infinity;
  const comune: Record<string, unknown> = {
    modello: nome,
    data,
    ...(serie ? { serie } : {}),
    impronta: imp,
    versione_programma: versioneProgramma(),
    hardware,
    differenze_hardware: differenze,
    avvio: { ...conf, ambiente_ollama: ambiente },
    parametri_chiamata: config.parametri_chiamata,
    pausa_s: pausaMs / 1000,
    energia: locale ? { fonte: "nvidia-smi", campo: CAMPO_POTENZA, intervallo_ms: INTERVALLO_MS } : null,
    // Ciò che rende confrontabili modelli diversi (vedi Confronto in calcoli.ts); non entra nell'impronta.
    confronto: {
      parametri: config.parametri_chiamata,
      esercizi: esercizi.map((e) => e.nome),
      formati: Object.fromEntries(esercizi.map((e) => [e.nome, e.formato])),
      versione_prompt: VERSIONE_PROMPT,
      impronta_esercizi: improntaEsercizi(esercizi),
    },
  };
  const scrivi = (riga: Record<string, unknown>) => appendFileSync(fileJsonl, JSON.stringify({ ...riga, ...comune }) + "\n");

  const giro = serie ? `, giro ${serie.giro}/${serie.giri}` : "";
  console.log(`> ${nome} (${conf.tipo}${giro}), ${esercizi.length} esercizi → ${fileJsonl.replace(RADICE + "/", "")}`);
  const misuratore: Misuratore | null = locale ? avviaMisuratore() : null;
  const energia = async (e: EsitoChiamata) => {
    if (!misuratore) return null;
    await misuratore.attendiFino(e.fine);
    return whIntegrati(misuratore.campioni, e.inizio, e.fine);
  };

  const righe: RigaEsercizio[] = [];
  let chiamateFatte = 0;
  let interruzione: string | null = null;
  let riposoW: number | null = null;
  let prompt: { tps: number | null; token: number | null } = { tps: null, token: null };
  const chiama = async (messaggio: string, parametri: ParametriChiamata) => {
    if (chiamateFatte >= tetto) throw new Fermata(`tetto di ${tetto} chiamate raggiunto`);
    // Dal secondo giro la pausa vale anche prima della prima chiamata (giri consecutivi sullo stesso endpoint).
    if ((chiamateFatte > 0 || (serie?.giro ?? 1) > 1) && pausaMs > 0) await attendi(pausaMs);
    chiamateFatte++;
    const e = await chiamata({ url: conf.url, chiave, modello: conf.id, messaggi: [{ role: "user", content: messaggio }], parametri });
    if (e.stato_http === 429) throw new Fermata(`HTTP 429 (limite di richieste): ${e.errore}`);
    // Senza nuovi tentativi un esercizio con 503 è perso: fermarsi non spreca altre chiamate
    // e lascia l'esecuzione incompleta, quindi --tutti la rifà.
    if (e.stato_http === 503) throw new Fermata(`HTTP 503 (servizio sovraccarico, riprova più tardi): ${e.errore}`);
    return e;
  };

  try {
    // ---- potenza a riposo ----
    // Finestre di 5 s finché la potenza smette di scendere (dopo un modello appena scaricato
    // la GPU resta per un po' in uno stato ad alto consumo). Vale l'ultima finestra.
    if (misuratore) {
      const medie: (number | null)[] = [];
      while (medie.length < RIPOSO_FINESTRE_MAX && !potenzaStabile(medie)) {
        const inizio = Date.now();
        await attendi(RIPOSO_MS);
        await misuratore.attendiFino(Date.now());
        medie.push(potenzaMedia(misuratore.campioni, inizio, Date.now()));
        if (misuratore.errore) break;
      }
      riposoW = medie[medie.length - 1] ?? null;
      if (misuratore.errore) console.warn(`  ! ${misuratore.errore}`);
      const stabile = potenzaStabile(medie);
      console.log(
        `  riposo: ${n1(riposoW)} W (finestre da ${RIPOSO_MS / 1000} s: ${medie.map(n1).join(", ")})` +
          `${stabile ? "" : " ! non stabile"}${conf.tipo === "llamacpp" ? " (modello già caricato)" : ""}`,
      );
      scrivi({ tipo: "riposo", potenza_w: riposoW, durata_ms: RIPOSO_MS, finestre_w: medie, stabile });
    }

    // ---- riscaldamento: carica il modello, non entra nelle misure ----
    let statoModello: unknown = null;
    if (locale) {
      const e = await chiamata({ url: conf.url, modello: conf.id, messaggi: [{ role: "user", content: "Ciao" }], parametri: { ...config.parametri_chiamata, max_tokens: 1 } });
      if (e.errore) throw new Fermata(`riscaldamento fallito: ${e.errore}`);
      if (conf.tipo === "ollama") {
        const m = (await ollamaCaricati()).find((x) => x.name === conf.id);
        statoModello = m ? { ...m, quota_gpu: m.size ? m.size_vram / m.size : null } : null;
        if (!m) throw new Fermata(`${conf.id} non risulta caricato in Ollama dopo il riscaldamento`);
        if (conf.contesto && m.context_length !== conf.contesto) {
          throw new Fermata(
            `contesto di Ollama ${m.context_length}, atteso ${conf.contesto}. Imposta OLLAMA_CONTEXT_LENGTH=${conf.contesto} nel servizio:\n` +
              `  sudo systemctl edit ollama   # aggiungi Environment="OLLAMA_CONTEXT_LENGTH=${conf.contesto}" sotto [Service]\n` +
              `  sudo systemctl restart ollama`,
          );
        }
        console.log(`  caricato: contesto ${m.context_length}, ${Math.round((100 * m.size_vram) / m.size)}% in GPU`);
      } else {
        statoModello = await propsLlama(conf.url);
        const nCtx = (statoModello as { n_ctx: number | null } | null)?.n_ctx;
        if (conf.contesto && nCtx != null && nCtx !== conf.contesto) throw new Fermata(`contesto di llama.cpp ${nCtx}, atteso ${conf.contesto}`);
        console.log(`  server pronto: contesto ${nCtx ?? "non letto"}`);
      }
      scrivi({ tipo: "riscaldamento", totale_ms: e.totale_ms, stato_modello: statoModello });
    }

    // ---- prompt lungo: velocità di lettura del prompt ----
    {
      const sessione = randomBytes(8).toString("hex");
      const testo = testoLungo(sessione, config.prompt_lungo.seme, config.prompt_lungo.parole);
      const e = await chiama(testo, { ...config.parametri_chiamata, max_tokens: 1 });
      // Se il primo token non porta testo (es. <think> tolto da Ollama) vale il primo frammento.
      const primo = e.primo_token_ms ?? e.primo_frammento_ms;
      prompt = { tps: tokenPromptAlSecondo(e.token_ingresso, primo), token: e.token_ingresso };
      const wh = await energia(e);
      console.log(`  prompt lungo: ${e.token_ingresso ?? "–"} token, primo token ${s(primo)} s → ${n1(prompt.tps)} token/s${e.errore ? `  ! ${e.errore}` : ""}`);
      scrivi({
        tipo: "prompt_lungo",
        max_tokens_usato: 1,
        sessione,
        token_ingresso: e.token_ingresso,
        token_uscita: e.token_uscita,
        primo_token_ms: primo,
        primo_token_misurato_su: e.primo_token_ms != null ? "testo" : e.primo_frammento_ms != null ? "frammento senza testo" : null,
        totale_ms: e.totale_ms,
        prompt_token_al_secondo: prompt.tps,
        wh,
        finish_reason: e.finish_reason,
        provider: e.provider,
        usage: e.usage,
        timings: e.timings,
        errore: e.errore,
      });
    }

    // ---- esercizi ----
    for (const es of esercizi) {
      const e = await chiama(promptEsercizio(es.consegna, es.formato, es.firma), config.parametri_chiamata);
      const wh = await energia(e);
      writeFileSync(join(cartellaRisposte, `${es.numero}.risposta.md`), e.testo);
      // Il ragionamento si salva sempre quando c'è: con una risposta troncata è l'unica traccia.
      if (e.ragionamento) writeFileSync(join(cartellaRisposte, `${es.numero}.ragionamento.md`), e.ragionamento);
      const risposta = estraiRisposta(e.testo, es.formato);
      let test = null;
      if (risposta != null) {
        const file = join(cartellaRisposte, `${es.numero}.${ESTENSIONE[es.formato]}`);
        writeFileSync(file, risposta);
        test = eseguiTest(es, file);
      }
      const riga: RigaEsercizio = {
        formato: es.formato,
        superato: test?.superato ?? false,
        token_al_secondo: tokenAlSecondo(e.token_uscita, e.totale_ms, e.primo_token_ms),
        primo_token_ms: e.primo_token_ms,
        totale_ms: e.totale_ms,
        token_uscita: e.token_uscita,
        token_ragionamento: e.token_ragionamento,
        wh,
        finish_reason: e.finish_reason,
        ragionamento_visto: e.ragionamento.length > 0 || (e.token_ragionamento ?? 0) > 0,
        errore_api: e.errore,
      };
      righe.push(riga);
      scrivi({
        tipo: "esercizio",
        esercizio: es.nome,
        ...riga,
        token_ingresso: e.token_ingresso,
        caratteri_ragionamento: e.ragionamento.length,
        provider: e.provider,
        risposta_estratta: risposta != null,
        test,
        usage: e.usage,
        timings: e.timings,
        inizio: e.inizio,
        fine: e.fine,
      });
      const esito = e.errore ? `ERRORE API` : risposta == null ? `nessun blocco ${LINGUAGGIO[es.formato]}` : test!.superato ? "superato" : `fallito (${test!.pass ?? 0} ok, ${test!.fail ?? "?"} ko${test!.timeout ? ", timeout" : ""})`;
      console.log(
        `  ${es.nome}: ${esito} | ${s(e.totale_ms)} s, primo token ${s(e.primo_token_ms)} s, ` +
          `${e.token_ingresso ?? "–"}→${e.token_uscita ?? "–"} token, ${n1(riga.token_al_secondo)} tok/s, ` +
          `${wh == null ? "–" : wh.toFixed(4)} Wh${e.provider ? ` | ${e.provider}` : ""}${e.finish_reason === "length" ? " | TRONCATO (length)" : ""}${e.errore ? ` | ${e.errore}` : ""}`,
      );
    }
  } catch (err) {
    if (!(err instanceof Fermata)) throw err;
    interruzione = err.message;
    console.error(`  ! fermato: ${interruzione}`);
  } finally {
    misuratore?.ferma();
    if (conf.tipo === "ollama") await scaricaOllama().catch(() => {});
  }

  const noteAuto = [
    conf.note ?? "",
    righe.length && righe.every((r) => !r.ragionamento_visto) ? "nessun ragionamento osservato: reasoning_effort ignorato o modello che non ragiona" : "",
    interruzione ? `interrotto: ${interruzione.split("\n")[0]}` : "",
  ];
  const riassunto = riassumi(righe, {
    modello: nome,
    data,
    riposo_w: riposoW,
    prompt_token_al_secondo: prompt.tps,
    prompt_token: prompt.token,
    completo: interruzione == null && righe.length === esercizi.length,
    note: noteAuto.filter(Boolean).join(" "),
  });
  scrivi({ tipo: "fine", riassunto, chiamate: chiamateFatte, interruzione });
  if (righe.length === 0) {
    console.log(`  nessun esercizio eseguito: riepilogo non aggiornato (dettagli in ${fileJsonl.replace(RADICE + "/", "")})`);
    throw new Fermata(`${nome}: nessun esercizio eseguito`);
  }
  const { esecuzioni: tutte } = rigeneraRiepilogo(config.parametri_chiamata, RISULTATI);
  const questa = tutte.find((x) => x.modello === nome && x.data === data);
  if (questa) console.log(`  ${questa.locale ? rigaLocale(questa) : rigaApi(questa)}`);
  console.log(`  riepilogo aggiornato: risultati/riepilogo.md`);
  return interruzione != null;
}

let fallimenti = 0;
for (const nome of nomi) {
  try {
    const id = randomBytes(4).toString("hex");
    for (let g = 1; g <= ripetizioni; g++) {
      // Un giro interrotto (429, 503, tetto) ferma anche i giri successivi dello stesso modello.
      if (await eseguiModello(nome, ripetizioni > 1 ? { id, giro: g, giri: ripetizioni } : null)) {
        if (g < ripetizioni) console.error(`  ! ${nome}: giri ${g + 1}–${ripetizioni} non eseguiti`);
        break;
      }
    }
  } catch (err) {
    if (!(err instanceof Fermata)) throw err;
    fallimenti++;
    console.error(`! ${err.message}`);
  }
}
if (fallimenti) process.exit(1);
