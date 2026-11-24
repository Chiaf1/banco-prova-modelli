# Ciclo macchina

Scrivi `simula(eventi)` che fa passare una macchina per una sequenza di eventi (array di stringhe) e restituisce come è finita:

```ts
{ stato, pezzi, gravita, confermato, rifiutati }
```

- `stato`: `"fermo"`, `"avvio"`, `"lavoro"`, `"pausa"` o `"allarme"`. All'inizio è `"fermo"`, con 0 pezzi.
- `pezzi`: pezzi prodotti in tutta la sequenza (non si azzera mai).
- `gravita` (da 1 a 3) e `confermato`: solo in allarme; fuori dall'allarme valgono `0` e `false`.
- `rifiutati`: un oggetto `{ indice, evento, motivo }` per ogni evento rifiutato, in ordine. `indice` è la posizione dell'evento nell'array (da 0). Un evento rifiutato non cambia nulla, salvo il contatore dei rifiuti descritto sotto.

Fuori dall'allarme:

| evento | accettato in | effetto |
|---|---|---|
| `start` | fermo | va in avvio |
| `pronto` | avvio | va in lavoro |
| `pezzo` | lavoro | un pezzo in più, resta in lavoro |
| `pausa` | lavoro | va in pausa |
| `riprendi` | pausa | va in lavoro |
| `stop` | avvio, lavoro, pausa | va in fermo |
| `allarme` | qualunque stato | va in allarme con gravità 1, non confermato, e ricorda lo stato da cui è partito |

In allarme:

- `allarme`: accettato. La gravità sale di 1 (massimo 3; a 3 resta 3) e l'allarme torna non confermato.
- `conferma`: se non è confermato lo conferma, altrimenti è rifiutato con motivo `"già confermato"`.
- `riprendi`: se non è confermato è rifiutato con `"allarme da confermare"`; se la gravità è più di 1 è rifiutato con `"gravità troppo alta"`; altrimenti la macchina torna **nello stato in cui era prima dell'allarme** (che può essere fermo, avvio, lavoro o pausa).
- `reset`: se non è confermato è rifiutato con `"allarme da confermare"`; altrimenti va in fermo.
- Ogni altro evento noto è rifiutato con `"non ammesso in allarme"`.

Motivi dei rifiuti:

- Evento che non è nell'elenco (`start`, `pronto`, `pezzo`, `pausa`, `riprendi`, `stop`, `allarme`, `conferma`, `reset`): `"sconosciuto"`, in qualunque stato. Il confronto è esatto: `"Start"` è sconosciuto.
- Evento noto non accettato nello stato corrente (fuori dall'allarme): `"non ammesso in <stato>"`, per esempio `"non ammesso in fermo"`.

Allarme automatico: quando la macchina **non** è in allarme e riceve **3 eventi rifiutati di fila** (sconosciuti compresi), subito dopo il terzo va in allarme come se fosse arrivato l'evento `allarme`. Il terzo evento resta comunque tra i rifiutati. Il contatore si azzera a ogni evento accettato; gli eventi rifiutati mentre la macchina è in allarme non contano.

L'array `eventi` non va modificato.
