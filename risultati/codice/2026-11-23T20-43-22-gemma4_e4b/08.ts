/**
 * Node della lista duplice.
 * Contiene la chiave e il valore, oltre ai puntatori prev e next.
 */
class Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null;
  next: Node<K, V> | null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

/**
 * Implementazione di una Cache LRU (Least Recently Used).
 * Utilizza un Map per l'accesso O(1) e una Lista Duplice per tracciare l'ordine di utilizzo.
 */
export class CacheLRU<K, V> {
  private capacity: number;
  // Mappa la chiave al nodo corrispondente nella lista duplice
  private map: Map<K, Node<K, V>>;
  // Sentinella all'inizio (LRU)
  private head: Node<K, V>;
  // Sentinella alla fine (MRU)
  private tail: Node<K, V>;

  constructor(capacita: number) {
    if (capacita < 1) {
      throw new RangeError("La capacità deve essere un intero maggiore o uguale a 1.");
    }
    this.capacity = capacita;
    this.map = new Map<K, Node<K, V>>();

    // Creazione dei nodi sentinella
    // Non hanno chiave/valore effettivi, servono solo come punti di ancoraggio
    this.head = new Node<K, V>(null as any, null as any);
    this.tail = new Node<K, V>(null as any, null as any);

    // Collegamento delle sentinelle: head <-> tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Rimuove un nodo specifico dalla lista duplice.
   * @param node Il nodo da rimuovere.
   */
  private _removeNode(node: Node<K, V>): void {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  /**
   * Aggiunge un nodo alla fine della lista duplice (vicino alla sentinella tail),
   * rendendolo il più recentemente usato (MRU).
   * @param node Il nodo da aggiungere.
   */
  private _addToTail(node: Node<K, V>): void {
    const tailPrev = this.tail.prev!;
    
    // Collega il nodo tra tailPrev e tail
    tailPrev.next = node;
    node.prev = tailPrev;
    
    node.next = this.tail;
    this.tail.prev = node;
  }

  /**
   * Sposta un nodo esistente alla fine della lista (MRU).
   * @param node Il nodo da spostare.
   */
  private _moveToTail(node: Node<K, V>): void {
    this._removeNode(node);
    this._addToTail(node);
  }

  /**
   * Ottiene il valore associato alla chiave. Conta come uso.
   * @param chiave La chiave da cercare.
   * @returns Il valore o undefined.
   */
  get(chiave: K): V | undefined {
    const node = this.map.get(chiave);
    if (!node) {
      return undefined;
    }
    // Conta come uso: sposta il nodo alla fine (MRU)
    this._moveToTail(node);
    return node.value;
  }

  /**
   * Inserisce o aggiorna una chiave-valore. Conta come uso.
   * Se la cache è piena e la chiave è nuova, elimina l'elemento LRU.
   * @param chiave La chiave.
   * @param valore Il valore.
   */
  set(chiave: K, valore: V): void {
    const existingNode = this.map.get(chiave);

    if (existingNode) {
      // 1. Aggiornamento: aggiorna il valore e sposta alla fine
      existingNode.value = valore;
      this._moveToTail(existingNode);
    } else {
      // 2. Inserimento:
      
      // Controlla se la cache è piena
      if (this.map.size >= this.capacity) {
        // Trova l'elemento LRU (il nodo subito dopo la sentinella head)
        const lruNode = this.head.next!;
        
        // Rimuovi l'LRU dalla lista e dalla mappa
        this._removeNode(lruNode);
        this.map.delete(lruNode.key);
      }

      // Crea il nuovo nodo
      const newNode = new Node<K, V>(chiave, valore);
      
      // Aggiungi alla mappa e alla fine della lista (MRU)
      this.map.set(chiave, newNode);
      this._addToTail(newNode);
    }
  }

  /**
   * Controlla se la chiave esiste. Non conta come uso.
   * @param chiave La chiave da cercare.
   * @returns True se la chiave è presente, false altrimenti.
   */
  has(chiave: K): boolean {
    return this.map.has(chiave);
  }

  /**
   * Proprietà che restituisce il numero di elementi nella cache.
   */
  get size(): number {
    return this.map.size;
  }

  /**
   * Restituisce un array delle chiavi ordinate dalla meno recente alla più recente (LRU -> MRU).
   * Non conta come uso.
   * @returns Array delle chiavi.
   */
  chiavi(): K[] {
    const keys: K[] = [];
    // Inizia dal nodo dopo la sentinella head (LRU)
    let current = this.head.next!;
    // Finisce prima della sentinella tail (MRU)
    while (current !== this.tail) {
      keys.push(current.key);
      current = current.next!;
    }
    return keys;
  }
}
