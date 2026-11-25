const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function parseDate(s: string): number {
  if (typeof s !== "string") throw new RangeError("data non valida");
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new RangeError("data non valida");
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) throw new RangeError("data non valida");
  const leap = isLeapYear(y);
  const dim = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  if (d < 1 || d > dim) throw new RangeError("data non valida");
  const t = Date.UTC(y, mo - 1, d);
  if (t < Date.UTC(1990, 0, 1) || t > Date.UTC(2199, 11, 31)) {
    throw new RangeError("data non valida");
  }
  return t;
}

function pasquetta(y: number): number {
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
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = Date.UTC(y, month - 1, day);
  return easter + MS_PER_DAY;
}

function isHoliday(t: number): boolean {
  const dt = new Date(t);
  const y = dt.getUTCFullYear();
  const mo = dt.getUTCMonth() + 1;
  const d = dt.getUTCDate();
  if (
    (mo === 1 && d === 1) ||
    (mo === 1 && d === 6) ||
    (mo === 4 && d === 25) ||
    (mo === 5 && d === 1) ||
    (mo === 8 && d === 15) ||
    (mo === 11 && d === 1) ||
    (mo === 12 && d === 8) ||
    (mo === 12 && d === 25) ||
    (mo === 12 && d === 26)
  ) {
    return true;
  }
  if (mo === 6 && d === 2 && !(y >= 1990 && y <= 2000)) return true;
  if (mo === 10 && d === 4 && y >= 2026) return true;
  if (t === pasquetta(y)) return true;
  return false;
}

function count(da: number, a: number): number {
  let n = 0;
  for (let t = da; t <= a; t += MS_PER_DAY) {
    const dow = new Date(t).getUTCDay();
    if (dow >= 1 && dow <= 5 && !isHoliday(t)) n++;
  }
  return n;
}

export function giorniLavorativi(da: string, a: string): number {
  const t1 = parseDate(da);
  const t2 = parseDate(a);
  if (t1 > t2) return -giorniLavorativi(a, da);
  return count(t1, t2);
}
