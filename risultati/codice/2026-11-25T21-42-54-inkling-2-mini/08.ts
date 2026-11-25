export class CacheLRU<K, V> {
  private readonly capacita: number;
  private readonly map = new Map<K, V>();

  constructor(capacita: number) {
    if (!Number.isInteger(capacita) || capacita < 1) {
      throw new RangeError("capacita deve essere un intero >= 1");
    }
    this.capacita = capacita;
  }

  get(chiave: K): V | undefined {
    if (!this.map.has(chiave)) {
      return undefined;
    }
    const valore = this.map.get(chiave) as V;
    this.map.delete(chiave);
    this.map.set(chiave, valore);
    return valore;
  }

  set(chiave: K, valore: V): void {
    if (this.map.has(chiave)) {
      this.map.delete(chiave);
    }
    this.map.set(chiave, valore);
    if (this.map.size > this.capacita) {
      const primaChiave = this.map.keys().next().value as K;
      this.map.delete(primaChiave);
    }
  }

  has(chiave: K): boolean {
    return this.map.has(chiave);
  }

  get size(): number {
    return this.map.size;
  }

  chiavi(): K[] {
    return Array.from(this.map.keys());
  }
}
