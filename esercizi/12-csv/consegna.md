# Leggi CSV

Scrivi `leggiCsv(testo, separatore)` che legge un testo CSV e restituisce un array di righe, ognuna un array di campi (stringhe). `separatore` vale `","` se non viene passato.

Regole:

- `separatore` deve essere un solo carattere diverso da `"`, `\r` e `\n`, altrimenti lancia un `RangeError`.
- I record finiscono con `\n` o `\r\n`; l'a capo dopo l'ultimo record è facoltativo. Le righe vuote (nessun carattere tra due a capo) si saltano ovunque. Testo vuoto o fatto solo di a capo: `[]`.
- I campi non vengono ripuliti: gli spazi fanno parte del campo. `"a,"` dà i campi `"a"` e `""`.
- Un campo è tra virgolette se il suo **primo** carattere è `"`. Dentro le virgolette `""` vale una virgoletta, e separatore, `\n` e `\r` sono testo normale. Dopo la virgoletta di chiusura possono venire solo il separatore, un a capo o la fine del testo. Un campo tra virgolette vuoto (`""`) è un campo vuoto, e una riga che contiene solo quello non è una riga vuota.
- Tutti i record devono avere lo stesso numero di campi del primo.

Errori: lancia un `SyntaxError` con il messaggio esatto `riga R, colonna C: motivo`. R è la riga fisica del testo (da 1, e conta anche gli a capo dentro le virgolette), C è la posizione del carattere in quella riga (da 1). Si segnala solo il primo errore che si incontra leggendo il testo dall'inizio. I motivi e la posizione da segnalare:

| motivo | posizione |
|---|---|
| `virgolette in un campo senza virgolette` | la `"` trovata in un campo che non inizia con `"` |
| `carattere dopo le virgolette di chiusura` | il primo carattere non ammesso dopo la `"` di chiusura |
| `virgolette non chiuse` | la `"` di apertura del campo che arriva alla fine del testo senza chiudersi |
| `a capo non valido` | un `\r` fuori dalle virgolette non seguito da `\n` (anche subito dopo una `"` di chiusura) |
| `attesi N campi, trovati M` | colonna 1 della riga dove **inizia** il record sbagliato; N è il numero di campi del primo record |

Esempio: `leggiCsv('nome,nota\nAnna,"dice ""ciao"", poi va"\n')` → `[["nome", "nota"], ["Anna", 'dice "ciao", poi va']]`.
