export function fondiIntervalli(intervalli: [number, number][]): [number, number][] {
  // Validate all intervals
  for (const [start, end] of intervalli) {
    if (start > end) {
      throw new RangeError('Intervallo non valido');
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new RangeError('Valori non finiti');
    }
  }

  // Handle empty input
  if (intervalli.length === 0) {
    return [];
  }

  // Create a sorted copy of intervals
  const sorted = [...intervalli].sort((a, b) => a[0] - b[0]);

  // Merge intervals
  const merged: [number, number][] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next[0] <= current[1]) {
      // Merge overlapping or adjacent intervals
      current = [current[0], Math.max(current[1], next[1])];
    } else {
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
}
