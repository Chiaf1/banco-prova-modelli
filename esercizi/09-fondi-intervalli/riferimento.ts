export function fondiIntervalli(intervalli: [number, number][]): [number, number][] {
  for (const [a, b] of intervalli) {
    if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) throw new RangeError("intervallo non valido");
  }
  const ordinati = intervalli.map(([a, b]) => [a, b] as [number, number]).sort((x, y) => x[0] - y[0]);
  const out: [number, number][] = [];
  for (const [a, b] of ordinati) {
    const ultimo = out[out.length - 1];
    if (ultimo && a <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], b);
    else out.push([a, b]);
  }
  return out;
}
