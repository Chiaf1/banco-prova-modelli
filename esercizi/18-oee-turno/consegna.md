# OEE di un turno

Dati del turno A di lunedì sulla linea di stampaggio S2 (dati inventati). Il turno va dalle 06:00 alle 14:00. Il tempo ciclo ideale è di 24 secondi per pezzo.

Eventi del turno:

| Inizio | Fine  | Evento                                    | Linea ferma | Pianificato |
|--------|-------|-------------------------------------------|-------------|-------------|
| 08:10  | 08:37 | guasto alla pompa idraulica               | sì          | no          |
| 09:15  | 09:25 | controllo qualità a campione              | no          | sì          |
| 10:00  | 10:30 | pausa mensa                               | sì          | sì          |
| 11:20  | 11:38 | attesa materiale dal magazzino            | sì          | no          |
| 12:30  | 12:45 | riunione di reparto                       | sì          | sì          |

Produzione per ora (i pezzi prodotti comprendono scarti e rilavorati):

| Ora         | Pezzi prodotti | Scarti | Rilavorati |
|-------------|----------------|--------|------------|
| 06:00-07:00 | 131            | 3      | 1          |
| 07:00-08:00 | 128            | 2      | 0          |
| 08:00-09:00 | 74             | 5      | 2          |
| 09:00-10:00 | 133            | 4      | 1          |
| 10:00-11:00 | 68             | 1      | 0          |
| 11:00-12:00 | 94             | 3      | 3          |
| 12:00-13:00 | 101            | 2      | 1          |
| 13:00-14:00 | 127            | 2      | 1          |

Definizioni da usare:

- tempo pianificato = durata del turno − fermi pianificati (contano solo gli eventi con la linea ferma);
- tempo di funzionamento = tempo pianificato − fermi non pianificati;
- disponibilità = tempo di funzionamento / tempo pianificato;
- prestazioni = (tempo ciclo ideale × pezzi prodotti) / tempo di funzionamento;
- qualità = pezzi buoni / pezzi prodotti, dove i pezzi buoni sono quelli prodotti meno scarti e rilavorati (un pezzo rilavorato non è buono al primo colpo);
- OEE = disponibilità × prestazioni × qualità.

Rispondi con un oggetto JSON con esattamente questi campi:

- `tempo_pianificato_min`, `tempo_funzionamento_min` (interi, in minuti);
- `pezzi_prodotti`, `pezzi_buoni` (interi);
- `disponibilita`, `prestazioni`, `qualita`, `oee` (numeri, in percentuale con un decimale, per esempio `91.3` per 91,3%). Calcola l'OEE dai valori non arrotondati e arrotonda solo alla fine.
