# Fondi intervalli

Scrivi `fondiIntervalli(intervalli)` che riceve intervalli chiusi `[inizio, fine]` e restituisce gli intervalli fusi.

- Due intervalli che si sovrappongono o si toccano (`[1, 3]` e `[3, 5]`) diventano uno solo (`[1, 5]`).
- Il risultato è ordinato per inizio crescente e non contiene intervalli che si toccano o si sovrappongono.
- L'input può essere in qualunque ordine. Non modificarlo: né l'array esterno né le coppie interne. Le coppie del risultato devono essere array nuovi.
- Un intervallo con `inizio > fine`, o con valori non finiti, fa lanciare un `RangeError`.
- Input vuoto: array vuoto.
