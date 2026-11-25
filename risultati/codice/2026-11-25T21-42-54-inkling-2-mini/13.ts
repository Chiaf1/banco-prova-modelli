export type Stato = "fermo" | "avvio" | "lavoro" | "pausa" | "allarme";

export type Esito = {
  stato: Stato;
  pezzi: number;
  gravita: number;
  confermato: boolean;
  rifiutati: { indice: number; evento: string; motivo: string }[];
};

export function simula(eventi: string[]): Esito {
  const noti = new Set([
    "start", "pronto", "pezzo", "pausa", "riprendi",
    "stop", "allarme", "conferma", "reset",
  ]);

  let stato: Stato = "fermo";
  let pezzi = 0;
  let gravita = 0;
  let confermato = false;
  let statoDaAllarme: Stato = "fermo";
  const rifiutati: { indice: number; evento: string; motivo: string }[] = [];
  let rifiutiFila = 0;

  for (let i = 0; i < eventi.length; i++) {
    const evento = eventi[i];
    let accettato = false;

    if (stato === "allarme") {
      if (!noti.has(evento)) {
        rifiutati.push({ indice: i, evento, motivo: "sconosciuto" });
      } else if (evento === "allarme") {
        gravita = Math.min(3, gravita + 1);
        confermato = false;
        accettato = true;
      } else if (evento === "conferma") {
        if (!confermato) {
          confermato = true;
          accettato = true;
        } else {
          rifiutati.push({ indice: i, evento, motivo: "già confermato" });
        }
      } else if (evento === "riprendi") {
        if (!confermato) {
          rifiutati.push({ indice: i, evento, motivo: "allarme da confermare" });
        } else if (gravita > 1) {
          rifiutati.push({ indice: i, evento, motivo: "gravità troppo alta" });
        } else {
          stato = statoDaAllarme;
          gravita = 0;
          confermato = false;
          accettato = true;
        }
      } else if (evento === "reset") {
        if (!confermato) {
          rifiutati.push({ indice: i, evento, motivo: "allarme da confermare" });
        } else {
          stato = "fermo";
          gravita = 0;
          confermato = false;
          accettato = true;
        }
      } else {
        rifiutati.push({ indice: i, evento, motivo: "non ammesso in allarme" });
      }
      if (accettato) rifiutiFila = 0;
    } else {
      if (!noti.has(evento)) {
        rifiutati.push({ indice: i, evento, motivo: "sconosciuto" });
      } else if (evento === "start") {
        if (stato === "fermo") { stato = "avvio"; accettato = true; }
        else rifiutati.push({ indice: i, evento, motivo: `non ammesso in ${stato}` });
      } else if (evento === "pronto") {
        if (stato === "avvio") { stato = "lavoro"; accettato = true; }
        else rifiutati.push({ indice: i, evento, motivo: `non ammesso in ${stato}` });
      } else if (evento === "pezzo") {
        if (stato === "lavoro") { pezzi++; accettato = true; }
        else rifiutati.push({ indice: i, evento, motivo: `non ammesso in ${stato}` });
      } else if (evento === "pausa") {
        if (stato === "lavoro") { stato = "pausa"; accettato = true; }
        else rifiutati.push({ indice: i, evento, motivo: `non ammesso in ${stato}` });
      } else if (evento === "riprendi") {
        if (stato === "pausa") { stato = "lavoro"; accettato = true; }
        else rifiutati.push({ indice: i, evento, motivo: `non ammesso in ${stato}` });
      } else if (evento === "stop") {
        if (stato === "avvio" || stato === "lavoro" || stato === "pausa") {
          stato = "fermo";
          accettato = true;
        } else {
          rifiutati.push({ indice: i, evento, motivo: `non ammesso in ${stato}` });
        }
      } else if (evento === "allarme") {
        statoDaAllarme = stato;
        stato = "allarme";
        gravita = 1;
        confermato = false;
        accettato = true;
      } else {
        rifiutati.push({ indice: i, evento, motivo: `non ammesso in ${stato}` });
      }

      if (accettato) {
        rifiutiFila = 0;
      } else {
        rifiutiFila++;
        if (rifiutiFila === 3) {
          statoDaAllarme = stato;
          stato = "allarme";
          gravita = 1;
          confermato = false;
          rifiutiFila = 0;
        }
      }
    }
  }

  return { stato, pezzi, gravita, confermato, rifiutati };
}
