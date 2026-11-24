export type Stato = "fermo" | "avvio" | "lavoro" | "pausa" | "allarme";

export type Esito = {
  stato: Stato;
  pezzi: number;
  gravita: number;
  confermato: boolean;
  rifiutati: { indice: number; evento: string; motivo: string }[];
};

export function simula(eventi: string[]): Esito {
  throw new Error("da implementare");
}
