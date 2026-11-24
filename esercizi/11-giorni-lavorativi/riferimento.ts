// Le date sono contate come numero di giorni dal 1970-01-01 (Date.UTC), senza ore locali.
const GIORNO = 86_400_000;

function leggi(data: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!m) throw new RangeError(`data non valida: ${data}`);
  const [anno, mese, giorno] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (anno < 1990 || anno > 2199) throw new RangeError(`anno fuori intervallo: ${data}`);
  const t = Date.UTC(anno, mese - 1, giorno);
  const d = new Date(t);
  if (d.getUTCFullYear() !== anno || d.getUTCMonth() !== mese - 1 || d.getUTCDate() !== giorno) {
    throw new RangeError(`data inesistente: ${data}`);
  }
  return t / GIORNO;
}

// Pasqua gregoriana (algoritmo anonimo di Meeus/Jones/Butcher): giorno dal 1970-01-01.
function pasqua(anno: number): number {
  const a = anno % 19, b = Math.floor(anno / 100), c = anno % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(anno, mese - 1, giorno) / GIORNO;
}

function festivita(anno: number): Set<number> {
  const g = (mese: number, giorno: number) => Date.UTC(anno, mese - 1, giorno) / GIORNO;
  const s = new Set([g(1, 1), g(1, 6), g(4, 25), g(5, 1), g(8, 15), g(11, 1), g(12, 8), g(12, 25), g(12, 26)]);
  s.add(pasqua(anno) + 1);
  if (anno < 1990 || anno > 2000) s.add(g(6, 2));
  if (anno >= 2026) s.add(g(10, 4));
  return s;
}

export function giorniLavorativi(da: string, a: string): number {
  const inizio = leggi(da), fine = leggi(a);
  if (inizio > fine) return 0 - giorniLavorativi(a, da);
  const cache = new Map<number, Set<number>>();
  let n = 0;
  for (let t = inizio; t <= fine; t++) {
    const d = new Date(t * GIORNO);
    const settimana = d.getUTCDay();
    if (settimana === 0 || settimana === 6) continue;
    const anno = d.getUTCFullYear();
    if (!cache.has(anno)) cache.set(anno, festivita(anno));
    if (!cache.get(anno)!.has(t)) n++;
  }
  return n;
}
