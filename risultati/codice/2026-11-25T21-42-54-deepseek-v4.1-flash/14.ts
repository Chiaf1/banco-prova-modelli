export function diffRighe(vecchio: string, nuovo: string, contesto?: number): string {
  if (contesto === undefined) contesto = 1;
  if (!Number.isInteger(contesto) || contesto < 0) {
    throw new RangeError("contesto deve essere un intero >= 0");
  }

  const oldLines = splitLines(vecchio);
  const newLines = splitLines(nuovo);
  const n = oldLines.length;
  const m = newLines.length;

  const width = m + 1;
  const dp = new Uint32Array((n + 1) * width);

  for (let i = n - 1; i >= 0; i--) {
    const rowBase = i * width;
    const nextRowBase = (i + 1) * width;
    for (let j = m - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) {
        dp[rowBase + j] = dp[nextRowBase + j + 1] + 1;
      } else {
        const a = dp[nextRowBase + j];
        const b = dp[rowBase + j + 1];
        dp[rowBase + j] = a > b ? a : b;
      }
    }
  }

  type Op = { type: 'equal' | 'delete' | 'insert'; line: string };
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && oldLines[i] === newLines[j]) {
      ops.push({ type: 'equal', line: oldLines[i] });
      i++;
      j++;
    } else if (i < n && (j >= m || dp[(i + 1) * width + j] === dp[i * width + j])) {
      ops.push({ type: 'delete', line: oldLines[i] });
      i++;
    } else {
      ops.push({ type: 'insert', line: newLines[j] });
      j++;
    }
  }

  const groups: { start: number; end: number }[] = [];
  let k = 0;
  while (k < ops.length) {
    if (ops[k].type !== 'equal') {
      const start = k;
      while (k < ops.length && ops[k].type !== 'equal') k++;
      groups.push({ start, end: k - 1 });
    } else {
      k++;
    }
  }

  if (groups.length === 0) return "";

  const blocks: { start: number; end: number }[] = [];
  let g = 0;
  while (g < groups.length) {
    let first = groups[g];
    let last = groups[g];
    g++;
    while (g < groups.length) {
      const gap = groups[g].start - last.end - 1;
      if (gap <= 2 * contesto) {
        last = groups[g];
        g++;
      } else {
        break;
      }
    }
    const start = Math.max(0, first.start - contesto);
    const end = Math.min(ops.length - 1, last.end + contesto);
    blocks.push({ start, end });
  }

  const prefixOld = new Uint32Array(ops.length + 1);
  const prefixNew = new Uint32Array(ops.length + 1);
  for (let idx = 0; idx < ops.length; idx++) {
    const op = ops[idx];
    prefixOld[idx + 1] = prefixOld[idx] + (op.type === 'insert' ? 0 : 1);
    prefixNew[idx + 1] = prefixNew[idx] + (op.type === 'delete' ? 0 : 1);
  }

  let result = "";
  for (const block of blocks) {
    const oldBefore = prefixOld[block.start];
    const newBefore = prefixNew[block.start];
    const N = prefixOld[block.end + 1] - oldBefore;
    const M = prefixNew[block.end + 1] - newBefore;
    const A = oldBefore + 1;
    const B = newBefore + 1;
    result += `@@ -${A},${N} +${B},${M} @@\n`;
    for (let idx = block.start; idx <= block.end; idx++) {
      const op = ops[idx];
      const prefix = op.type === 'equal' ? ' ' : op.type === 'delete' ? '-' : '+';
      result += prefix + op.line + '\n';
    }
  }

  return result;
}

function splitLines(s: string): string[] {
  if (s.length === 0) return [];
  const arr = s.split('\n');
  if (arr[arr.length - 1] === '') arr.pop();
  return arr;
}
