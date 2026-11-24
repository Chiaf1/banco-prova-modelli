export function diffRighe(vecchio: string, nuovo: string, contesto?: number): string {
  if (contesto === undefined) contesto = 1;
  if (!Number.isInteger(contesto) || contesto < 0) {
    throw new RangeError("contesto deve essere un intero >= 0");
  }

  const righe = (t: string): string[] => {
    const parts = t.split("\n");
    if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
    return parts;
  };

  const a = righe(vecchio);
  const b = righe(nuovo);
  const m = a.length;
  const n = b.length;

  // d[i][j] = minimo numero di cancellazioni+inserimenti per a[i..] vs b[j..]
  const stride = n + 1;
  const d = new Int32Array((m + 1) * stride);
  for (let i = m; i >= 0; i--) {
    for (let j = n; j >= 0; j--) {
      if (i === m && j === n) {
        d[i * stride + j] = 0;
      } else if (i === m) {
        d[i * stride + j] = n - j;
      } else if (j === n) {
        d[i * stride + j] = m - i;
      } else if (a[i] === b[j]) {
        d[i * stride + j] = d[(i + 1) * stride + (j + 1)];
      } else {
        const del = d[(i + 1) * stride + j] + 1;
        const ins = d[i * stride + (j + 1)] + 1;
        d[i * stride + j] = del < ins ? del : ins;
      }
    }
  }

  type Op = { t: "=" | "-" | "+"; v: string; o: number; nn: number };
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      ops.push({ t: "=", v: a[i], o: i, nn: j });
      i++; j++;
    } else if (i < m && d[(i + 1) * stride + j] + 1 === d[i * stride + j]) {
      ops.push({ t: "-", v: a[i], o: i, nn: j });
      i++;
    } else {
      ops.push({ t: "+", v: b[j], o: i, nn: j });
      j++;
    }
  }

  // gruppi: sequenze massimali di op consecutive non-uguali
  const groups: { s: number; e: number }[] = [];
  let k = 0;
  while (k < ops.length) {
    if (ops[k].t === "=") { k++; continue; }
    const s = k;
    while (k < ops.length && ops[k].t !== "=") k++;
    groups.push({ s, e: k });
  }

  // fusione dei gruppi con al massimo 2*contesto righe uguali in mezzo
  const blocks: { s: number; e: number }[] = [];
  for (const g of groups) {
    const last = blocks[blocks.length - 1];
    if (last) {
      const gap = g.s - last.e; // numero di op "=" tra i due gruppi
      if (gap <= 2 * contesto) {
        last.e = g.e;
        continue;
      }
    }
    blocks.push({ s: g.s, e: g.e });
  }

  let out = "";
  for (const blk of blocks) {
    const start = Math.max(0, blk.s - contesto);
    const end = Math.min(ops.length, blk.e + contesto);

    const primaVecchio = start === 0 ? 0 : ops[start - 1].o + 1;
    const primaNuovo = start === 0 ? 0 : ops[start - 1].nn + 1;

    let N = 0, M = 0;
    for (let t = start; t < end; t++) {
      if (ops[t].t !== "+") N++;
      if (ops[t].t !== "-") M++;
    }

    out += `@@ -${primaVecchio},${N} +${primaNuovo},${M} @@\n`;
    for (let t = start; t < end; t++) {
      out += ops[t].t + ops[t].v + "\n";
    }
  }

  return out;
}
