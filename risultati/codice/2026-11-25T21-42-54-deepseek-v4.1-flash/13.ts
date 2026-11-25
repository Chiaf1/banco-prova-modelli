export type Stato = "fermo" | "avvio" | "lavoro" | "pausa" | "allarme";

export type Esito = {
  stato: Stato;
  pezzi: number;
  gravita: number;
  confermato: boolean;
  rifiutati: { indice: number; evento: string; motivo: string }[];
};

export function simula(eventi: string[]): Esito {
  let stato: Stato = "fermo";
  let pezzi = 0;
  let gravita = 0;
  let confermato = false;
  const rifiutati: { indice: number; evento: string; motivo: string }[] = [];
  let statoPrimaAllarme: Stato = "fermo";
  let rifiutiConsecutivi = 0;

  const noti = new Set([
    "start",
    "pronto",
    "pezzo",
    "pausa",
    "riprendi",
    "stop",
    "allarme",
    "conferma",
    "reset",
  ]);

  for (let i = 0; i < eventi.length; i++) {
    const evento = eventi[i];

    if (!noti.has(evento)) {
      rifiutati.push({ indice: i, evento, motivo: "sconosciuto" });

      if (stato !== "allarme") {
        rifiutiConsecutivi++;
        if (rifiutiConsecutivi >= 3) {
          statoPrimaAllarme = stato;
          stato = "allarme";
          gravita = 1;
          confermato = false;
          rifiutiConsecutivi = 0;
        }
      }
      continue;
    }

    if (stato === "allarme") {
      if (evento === "allarme") {
        gravita = Math.min(3, gravita + 1);
        confermato = false;
        rifiutiConsecutivi = 0;
      } else if (evento === "conferma") {
        if (!confermato) {
          confermato = true;
          rifiutiConsecutivi = 0;
        } else {
          rifiutati.push({ indice: i, evento, motivo: "già confermato" });
        }
      } else if (evento === "riprendi") {
        if (!confermato) {
          rifiutati.push({ indice: i, evento, motivo: "allarme da confermare" });
        } else if (gravita > 1) {
          rifiutati.push({ indice: i, evento, motivo: "gravità troppo alta" });
        } else {
          stato = statoPrimaAllarme;
          gravita = 0;
          confermato = false;
          rifiutiConsecutivi = 0;
        }
      } else if (evento === "reset") {
        if (!confermato) {
          rifiutati.push({ indice: i, evento, motivo: "allarme da confermare" });
        } else {
          stato = "fermo";
          gravita = 0;
          confermato = false;
          rifiutiConsecutivi = 0;
        }
      } else {
        rifiutati.push({ indice: i, evento, motivo: "non ammesso in allarme" });
      }
      continue;
    }

    let accettato = false;
    let motivo = "";

    switch (evento) {
      case "start":
        if (stato === "fermo") {
          stato = "avvio";
          accettato = true;
        } else {
          motivo = `non ammesso in ${stato}`;
        }
        break;

      case "pronto":
        if (stato === "avvio") {
          stato = "lavoro";
          accettato = true;
        } else {
          motivo = `non ammesso in ${stato}`;
        }
        break;

      case "pezzo":
        if (stato === "lavoro") {
          pezzi++;
          accettato = true;
        } else {
          motivo = `non ammesso in ${stato}`;
        }
        break;

      case "pausa":
        if (stato === "lavoro") {
          stato = "pausa";
          accettato = true;
        } else {
          motivo = `non ammesso in ${stato}`;
        }
        break;

      case "riprendi":
        if (stato === "pausa") {
          stato = "lavoro";
          accettato = true;
        } else {
          motivo = `non ammesso in ${stato}`;
        }
        break;

      case "stop":
        if (stato === "avvio" || stato === "lavoro" || stato === "pausa") {
          stato = "fermo";
          accettato = true;
        } else {
          motivo = `non ammesso in ${stato}`;
        }
        break;

      case "allarme":
        statoPrimaAllarme = stato;
        stato = "allarme";
        gravita = 1;
        confermato = false;
        accettato = true;
        break;

      case "conferma":
      case "reset":
        motivo = `non ammesso in ${stato}`;
        break;

      default:
        motivo = "sconosciuto";
        break;
    }

    if (accettato) {
      rifiutiConsecutivi = 0;
    } else {
      rifiutati.push({ indice: i, evento, motivo });
      rifiutiConsecutivi++;

      if (rifiutiConsecutivi >= 3) {
        statoPrimaAllarme = stato;
        stato = "allarme";
        gravita = 1;
        confermato = false;
        rifiutiConsecutivi = 0;
      }
    }
  }

  return { stato, pezzi, gravita, confermato, rifiutati };
}
