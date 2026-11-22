// Potenza della GPU da nvidia-smi ogni 500 ms, per tutta la durata del banco.
// Ogni campione usa il timestamp scritto da nvidia-smi (ora locale con millisecondi),
// così non dipende da quando Node legge la riga.
import { spawn } from "node:child_process";
import { type Campione, leggiDataNvidia } from "./calcoli.ts";

export const CAMPO_POTENZA = "power.draw.instant";
export const INTERVALLO_MS = 500;

export type Misuratore = {
  campioni: Campione[];
  errore: string | null;
  attendiFino(t: number, massimoMs?: number): Promise<void>;
  ferma(): void;
};

export function avviaMisuratore(): Misuratore {
  const m: Misuratore = {
    campioni: [],
    errore: null,
    async attendiFino(t, massimoMs = 3000) {
      const limite = Date.now() + massimoMs;
      while (Date.now() < limite && !m.errore) {
        const ultimo = m.campioni[m.campioni.length - 1];
        if (ultimo && ultimo.t >= t) return;
        await new Promise((r) => setTimeout(r, 100));
      }
    },
    ferma() {
      processo.kill();
    },
  };
  const processo = spawn(
    "nvidia-smi",
    [`--query-gpu=timestamp,${CAMPO_POTENZA}`, "--format=csv,noheader,nounits", `-lms`, String(INTERVALLO_MS), "-i", "0"],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  processo.on("error", (e) => (m.errore = `nvidia-smi: ${e.message}`));
  let resto = "";
  processo.stdout.setEncoding("utf8").on("data", (pezzo: string) => {
    const righe = (resto + pezzo).split("\n");
    resto = righe.pop() ?? "";
    for (const r of righe) {
      const [data, watt] = r.split(",").map((s) => s.trim());
      const t = leggiDataNvidia(data ?? "");
      const w = Number(watt);
      if (!Number.isNaN(t) && Number.isFinite(w)) m.campioni.push({ t, w });
    }
  });
  return m;
}
