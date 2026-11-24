export type Stato = "fermo" | "avvio" | "lavoro" | "pausa" | "allarme";

export type Esito = {
  stato: Stato;
  pezzi: number;
  gravita: number;
  confermato: boolean;
  rifiutati: { indice: number; evento: string; motivo: string }[];
};

const NOTI = new Set(["start", "pronto", "pezzo", "pausa", "riprendi", "stop", "allarme", "conferma", "reset"]);
const NORMALI: Record<string, Partial<Record<Stato, Stato>>> = {
  start: { fermo: "avvio" },
  pronto: { avvio: "lavoro" },
  pezzo: { lavoro: "lavoro" },
  pausa: { lavoro: "pausa" },
  riprendi: { pausa: "lavoro" },
  stop: { avvio: "fermo", lavoro: "fermo", pausa: "fermo" },
};

export function simula(eventi: string[]): Esito {
  let stato: Stato = "fermo";
  let prima: Stato = "fermo";
  let pezzi = 0, gravita = 0, confermato = false, rifiutiDiFila = 0;
  const rifiutati: Esito["rifiutati"] = [];

  const allarme = () => {
    if (stato === "allarme") gravita = Math.min(3, gravita + 1);
    else { prima = stato; stato = "allarme"; gravita = 1; }
    confermato = false;
  };
  const esci = (verso: Stato) => { stato = verso; gravita = 0; confermato = false; };

  // Restituisce il motivo del rifiuto, oppure null se l'evento è accettato (e applicato).
  const applica = (e: string): string | null => {
    if (!NOTI.has(e)) return "sconosciuto";
    if (e === "allarme") { allarme(); return null; }
    if (stato === "allarme") {
      if (e === "conferma") {
        if (confermato) return "già confermato";
        confermato = true;
        return null;
      }
      if (e === "riprendi" || e === "reset") {
        if (!confermato) return "allarme da confermare";
        if (e === "riprendi" && gravita > 1) return "gravità troppo alta";
        esci(e === "riprendi" ? prima : "fermo");
        return null;
      }
      return "non ammesso in allarme";
    }
    const verso = NORMALI[e]?.[stato];
    if (!verso) return `non ammesso in ${stato}`;
    if (e === "pezzo") pezzi++;
    stato = verso;
    return null;
  };

  eventi.forEach((evento, indice) => {
    const inAllarme = stato === "allarme";
    const motivo = applica(evento);
    if (motivo === null) { rifiutiDiFila = 0; return; }
    rifiutati.push({ indice, evento, motivo });
    if (inAllarme) return;
    rifiutiDiFila++;
    if (rifiutiDiFila === 3) { rifiutiDiFila = 0; allarme(); }
  });
  return { stato, pezzi, gravita, confermato, rifiutati };
}
