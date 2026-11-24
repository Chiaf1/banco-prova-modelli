type Nodo<K, V> = {
  chiave: K;
  valore: V;
  prec: Nodo<K, V> | null;
  succ: Nodo<K, V> | null;
};

export class CacheLRU<K, V> {
  private capacita: number;
  private mappa: Map<K, Nodo<K, V>>;
  private testa: Nodo<K, V> | null;
  private coda: Nodo<K, V> | null;
  private _size: number;

  constructor(capacita: number) {
    if (!Number.isInteger(capacita) || capacita < 1) {
      throw new RangeError("La capacità deve essere un intero >= 1");
    }
    this.capacita = capacita;
    this.mappa = new Map();
    this.testa = null;
    this.coda = null;
    this._size = 0;
  }

  private creaNodo(chiave: K, valore: V): Nodo<K, V> {
    return { chiave, valore, prec: null, succ: null };
  }

  private scollega(nodo: Nodo<K, V>): void {
    const { prec, succ } = nodo;
    if (prec) prec.succ = succ;
    else this.testa = succ;
    if (succ) succ.prec = prec;
    else this.coda = prec;
    nodo.prec = null;
    nodo.succ = null;
  }

  private portaInTesta(nodo: Nodo<K, V>): void {
    nodo.prec = null;
    nodo.succ = this.testa;
    if (this.testa) this.testa.prec = nodo;
    else this.coda = nodo;
    this.testa = nodo;
  }

  get(chiave: K): V | undefined {
    const nodo = this.mappa.get(chiave);
    if (nodo === undefined) return undefined;
    this.scollega(nodo);
    this.portaInTesta(nodo);
    return nodo.valore;
  }

  set(chiave: K, valore: V): void {
    const esistente = this.mappa.get(chiave);
    if (esistente !== undefined) {
      esistente.valore = valore;
      this.scollega(esistente);
      this.portaInTesta(esistente);
      return;
    }
    const nuovo = this.creaNodo(chiave, valore);
    this.mappa.set(chiave, nuovo);
    this.portaInTesta(nuovo);
    this._size++;
    if (this._size > this.capacita) {
      const vecchia = this.coda;
      if (vecchia !== null) {
        this.mappa.delete(vecchia.chiave);
        this.scollega(vecchia);
        this._size--;
      }
    }
  }

  has(chiave: K): boolean {
    return this.mappa.has(chiave);
  }

  get size(): number {
    return this._size;
  }

  chiavi(): K[] {
    const risultato: K[] = [];
    let corrente = this.coda;
    while (corrente !== null) {
      risultato.push(corrente.chiave);
      corrente = corrente.succ;
    }
    return risultato;
  }
}
