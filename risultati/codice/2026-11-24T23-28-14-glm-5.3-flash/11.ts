export function giorniLavorativi(da: string, a: string): number {
  const d1 = parse(da);
  const d2 = parse(a);
  if (d1 > d2) return -giorniLavorativi(a, da);
  return conta(d1, d2);
}

function parse(s: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new RangeError("data non valida: " + s);
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(5, 7));
  const g = Number(s.slice(8, 10));
  if (y < 1990 || y > 2199) throw new RangeError("anno fuori intervallo: " + s);
  const t = Date.UTC(y, m - 1, g);
  const d = new Date(t);
  if (
    d.getUTCFullYear() !== y ||
    d.getUTCMonth() !== m - 1 ||
    d.getUTCDate() !== g
  ) {
    throw new RangeError("data inesistente: " + s);
  }
  return t;
}

const GIORNO = 86400000;

function conta(da: number, a: number): number {
  const festivi = new Set<number>();
  const annoIniz = new Date(da).getUTCFullYear();
  const annoFine = new Date(a).getUTCFullYear();
  for (let y = annoIniz; y <= annoFine; y++) {
    for (const [m, g] of [
      [1, 1], [1, 6], [4, 25], [5, 1], [8, 15],
      [11, 1], [12, 8], [12, 25], [12, 26],
    ]) {
      festivi.add(Date.UTC(y, m - 1, g));
    }
    // Pasquetta: giorno dopo Pasqua
    const [pm, pg] = pasqua(y);
    festivi.add(Date.UTC(y, pm - 1, pg + 1));
    // 2 giugno, tranne 1990-2000
    if (y < 1990 || y > 2000) festivi.add(Date.UTC(y, 5, 2));
    // 4 ottobre solo dal 2026
    if (y >= 2026) festivi.add(Date.UTC(y, 9, 4));
  }

  let n = 0;
  for (let t = da; t <= a; t += GIORNO) {
    const dow = new Date(t).getUTCDay(); // 0 dom, 6 sab
    if (dow >= 1 && dow <= 5 && !festivi.has(t)) n++;
  }
  return n;
}

// Algoritmo di Anonymous Gregorian (Meeus/Jones/Butcher)
function pasqua(y: number): [number, number] {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31);
  const giorno = ((h + l - 7 * m + 114) % 31) + 1;
  return [mese, giorno];
}
