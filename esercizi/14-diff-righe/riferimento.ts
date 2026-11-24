type Op = { tipo: " " | "-" | "+"; riga: string };

function righe(testo: string): string[] {
  if (testo === "") return [];
  const r = testo.split("\n");
  if (r[r.length - 1] === "") r.pop();
  return r;
}

// Script minimo: uguali appena possibile, poi cancellazione se resta minimo, altrimenti inserimento.
function script(a: string[], b: string[]): Op[] {
  const n = a.length, m = b.length, w = m + 1;
  const lcs = new Int32Array((n + 1) * w); // lcs[i*w+j] = sottosequenza comune più lunga di a[i..] e b[j..]
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * w + j] = a[i] === b[j] ? lcs[(i + 1) * w + j + 1] + 1 : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { ops.push({ tipo: " ", riga: a[i] }); i++; j++; }
    else if (i < n && (j === m || lcs[(i + 1) * w + j] === lcs[i * w + j])) { ops.push({ tipo: "-", riga: a[i] }); i++; }
    else { ops.push({ tipo: "+", riga: b[j] }); j++; }
  }
  return ops;
}

export function diffRighe(vecchio: string, nuovo: string, contesto = 1): string {
  if (!Number.isInteger(contesto) || contesto < 0) throw new RangeError("contesto non valido");
  const ops = script(righe(vecchio), righe(nuovo));

  // Gruppi di modifiche [inizio, fine) negli indici di ops, fusi se separati da ≤ 2*contesto uguali.
  const gruppi: [number, number][] = [];
  for (let k = 0; k < ops.length; ) {
    if (ops[k].tipo === " ") { k++; continue; }
    let f = k;
    while (f < ops.length && ops[f].tipo !== " ") f++;
    const ultimo = gruppi[gruppi.length - 1];
    if (ultimo && k - ultimo[1] <= 2 * contesto) ultimo[1] = f;
    else gruppi.push([k, f]);
    k = f;
  }

  let out = "";
  for (const [g0, g1] of gruppi) {
    const da = Math.max(0, g0 - contesto), a = Math.min(ops.length, g1 + contesto);
    let primaV = 0, primaN = 0;
    for (let k = 0; k < da; k++) {
      if (ops[k].tipo !== "+") primaV++;
      if (ops[k].tipo !== "-") primaN++;
    }
    const blocco = ops.slice(da, a);
    const nv = blocco.filter((o) => o.tipo !== "+").length;
    const nn = blocco.filter((o) => o.tipo !== "-").length;
    out += `@@ -${primaV + 1},${nv} +${primaN + 1},${nn} @@\n`;
    for (const o of blocco) out += o.tipo + o.riga + "\n";
  }
  return out;
}
