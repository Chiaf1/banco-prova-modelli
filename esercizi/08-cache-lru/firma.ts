export class CacheLRU<K, V> {
  constructor(capacita: number) {
    throw new Error("da implementare");
  }

  get(chiave: K): V | undefined {
    throw new Error("da implementare");
  }

  set(chiave: K, valore: V): void {
    throw new Error("da implementare");
  }

  has(chiave: K): boolean {
    throw new Error("da implementare");
  }

  get size(): number {
    throw new Error("da implementare");
  }

  chiavi(): K[] {
    throw new Error("da implementare");
  }
}
