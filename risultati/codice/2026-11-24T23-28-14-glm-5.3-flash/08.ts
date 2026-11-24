export class CacheLRU<K, V> {
  private readonly capacita: number;
  private readonly mappa = new Map<K, V>();

  constructor(capacita: number) {
    if (!Number.isInteger(capacita) || capacita < 1) {
      throw new RangeError("la capacità deve essere un intero ≥ 1");
    }
    this.capacita = capacita;
  }

  get(chiave: K): V | undefined {
    if (!this.mappa.has(chiave)) return undefined;
    const valore = this.mappa.get(chiave)!;
    this.mappa.delete(chiave);
    this.mappa.set(chiave, valore);
    return valore;
  }

  set(chiave: K, valore: V): void {
    if (this.mappa.has(chiave)) {
      this.mappa.delete(chiave);
    } else if (this.mappa.size >= this.capacita) {
      const piuVecchia = this.mappa.keys().next().value;
      if (piuVecchia !== undefined) this.mappa.delete(piuVecchia);
    }
    this.mappa.set(chiave, valore);
  }

  has(chiave: K): boolean {
    return this.mappa.has(chiave);
  }

  get size(): number {
    return this.mappa.size;
  }

  chiavi(): K[] {
    return [...this.mappa.keys()];
  }
}
