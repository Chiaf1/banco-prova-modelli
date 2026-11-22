export class CacheLRU<K, V> {
  #capacita: number;
  #mappa = new Map<K, V>();

  constructor(capacita: number) {
    if (!Number.isInteger(capacita) || capacita < 1) throw new RangeError("capacità non valida");
    this.#capacita = capacita;
  }

  get(chiave: K): V | undefined {
    if (!this.#mappa.has(chiave)) return undefined;
    const v = this.#mappa.get(chiave) as V;
    this.#mappa.delete(chiave);
    this.#mappa.set(chiave, v);
    return v;
  }

  set(chiave: K, valore: V): void {
    if (this.#mappa.has(chiave)) this.#mappa.delete(chiave);
    else if (this.#mappa.size >= this.#capacita) this.#mappa.delete(this.#mappa.keys().next().value as K);
    this.#mappa.set(chiave, valore);
  }

  has(chiave: K): boolean {
    return this.#mappa.has(chiave);
  }

  get size(): number {
    return this.#mappa.size;
  }

  chiavi(): K[] {
    return [...this.#mappa.keys()];
  }
}
