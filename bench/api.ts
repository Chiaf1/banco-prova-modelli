// Chiamata in streaming a un endpoint compatibile OpenAI (/chat/completions), senza dipendenze.

// Consuma le righe "data: ..." complete del buffer e restituisce il resto non ancora completo.
export function leggiSse(buffer: string, suEvento: (dati: string) => void): string {
  const righe = buffer.split("\n");
  const resto = righe.pop() ?? "";
  for (const r of righe) {
    const riga = r.replace(/\r$/, "");
    if (riga.startsWith("data:")) suEvento(riga.slice(5).trimStart());
  }
  return resto;
}

export type ParametriChiamata = {
  temperature: number;
  max_tokens: number;
  reasoning_effort?: string;
};

export type EsitoChiamata = {
  inizio: number; // ms epoch
  fine: number; // ms epoch
  primo_token_ms: number | null; // primo frammento con testo o ragionamento
  primo_frammento_ms: number | null; // primo frammento con choices, anche vuoto (es. token <think> tolto dal server)
  totale_ms: number;
  testo: string;
  ragionamento: string;
  finish_reason: string | null;
  token_ingresso: number | null;
  token_uscita: number | null;
  token_ragionamento: number | null; // se l'usage lo riporta
  usage: unknown;
  timings: unknown; // tempi propri del server (llama.cpp / Ollama), se presenti
  stato_http: number | null;
  errore: string | null;
  provider: string | null; // chi ha servito la chiamata, se l'API lo dice (campo `provider` di OpenRouter)
};

export async function chiamata(opz: {
  url: string; // base, es. http://localhost:11434/v1
  chiave?: string;
  modello: string;
  messaggi: { role: string; content: string }[];
  parametri: ParametriChiamata;
  timeoutMs?: number;
}): Promise<EsitoChiamata> {
  const corpo = {
    model: opz.modello,
    messages: opz.messaggi,
    stream: true,
    stream_options: { include_usage: true },
    ...opz.parametri,
  };
  const esito: EsitoChiamata = {
    inizio: Date.now(),
    fine: 0,
    primo_token_ms: null,
    primo_frammento_ms: null,
    totale_ms: 0,
    testo: "",
    ragionamento: "",
    finish_reason: null,
    token_ingresso: null,
    token_uscita: null,
    token_ragionamento: null,
    usage: null,
    timings: null,
    stato_http: null,
    errore: null,
    provider: null,
  };
  const t0 = performance.now();
  try {
    const risposta = await fetch(`${opz.url.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opz.chiave ? { Authorization: `Bearer ${opz.chiave}` } : {}),
      },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(opz.timeoutMs ?? 30 * 60_000),
    });
    esito.stato_http = risposta.status;
    if (!risposta.ok || !risposta.body) {
      esito.errore = `HTTP ${risposta.status}: ${(await risposta.text()).slice(0, 500)}`;
    } else {
      const decoder = new TextDecoder();
      let buffer = "";
      const suEvento = (dati: string) => {
        if (dati === "[DONE]") return;
        let j: any;
        try {
          j = JSON.parse(dati);
        } catch {
          return;
        }
        if (typeof j.provider === "string" && j.provider) esito.provider = j.provider;
        if (j.error) esito.errore = `errore nello stream: ${JSON.stringify(j.error).slice(0, 500)}`;
        const scelta = j.choices?.[0];
        if (scelta && esito.primo_frammento_ms == null) esito.primo_frammento_ms = performance.now() - t0;
        const delta = scelta?.delta ?? {};
        const testo: string = delta.content ?? "";
        const ragionamento: string = delta.reasoning_content ?? delta.reasoning ?? "";
        if ((testo || ragionamento) && esito.primo_token_ms == null) esito.primo_token_ms = performance.now() - t0;
        esito.testo += testo;
        esito.ragionamento += ragionamento;
        if (scelta?.finish_reason) esito.finish_reason = scelta.finish_reason;
        if (j.usage) {
          esito.usage = j.usage;
          esito.token_ingresso = j.usage.prompt_tokens ?? null;
          esito.token_uscita = j.usage.completion_tokens ?? null;
          esito.token_ragionamento = j.usage.completion_tokens_details?.reasoning_tokens ?? null;
        }
        if (j.timings) esito.timings = j.timings;
      };
      for await (const pezzo of risposta.body) {
        buffer = leggiSse(buffer + decoder.decode(pezzo, { stream: true }), suEvento);
      }
      leggiSse(buffer + "\n", suEvento);
    }
  } catch (e) {
    esito.errore = `richiesta fallita: ${(e as Error).message}`;
  }
  esito.totale_ms = performance.now() - t0;
  esito.fine = Date.now();
  return esito;
}
