export class CacheLRU<K, V> {
  private capacita: number;
  private mappa: Map<K, V>;

  constructor(capacita: number) {
    if (!Number.isInteger(capacita) || capacita < 1) {
      throw new RangeError("capacita deve essere un intero >= 1");
    }
    this.capacita = capacita;
    this.mappa = new Map<K, V>();
  }

  get(chiave: K): V | undefined {
    if (!this.mappa.has(chiave)) {
      return undefined;
    }
    const valore = this.mappa.get(chiave) as V;
    this.mappa.delete(chiave);
    this.mappa.set(chiave, valore);
    return valore;
  }

  set(chiave: K, valore: V): void {
    if (this.mappa.has(chiave)) {
      this.mappa.delete(chiave);
    } else if (this.mappa.size >= this.capacita) {
      const menoRecente = this.mappa.keys().next().value as K;
      this.mappa.delete(menoRecente);
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
    return Array.from(this.mappa.keys());
  }
}
