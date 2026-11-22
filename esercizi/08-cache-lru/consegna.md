# Cache LRU

Scrivi la classe `CacheLRU<K, V>`: una cache con capacità fissa che, quando è piena, elimina l'elemento usato meno di recente.

- `new CacheLRU(capacita)`: `capacita` è un intero ≥ 1, altrimenti lancia un `RangeError`.
- `get(chiave)`: restituisce il valore, oppure `undefined` se la chiave non c'è. Se la chiave c'è, conta come uso.
- `set(chiave, valore)`: inserisce o aggiorna. Conta come uso. Se la chiave è nuova e la cache è piena, prima elimina l'elemento usato meno di recente.
- `has(chiave)`: dice se la chiave c'è, senza contare come uso.
- `size`: proprietà in sola lettura (getter) con il numero di elementi.
- `chiavi()`: array delle chiavi dalla meno recente alla più recente, senza contare come uso.

`get` e `set` devono richiedere tempo costante in media, non proporzionale alla capacità.
