# banco-prova-modelli

Banco minimo per mettere alla prova modelli di linguaggio, locali e via API, sugli stessi 13 esercizi: 9 di codice in TypeScript e 4 non di codice, con la risposta in JSON o in testo. Ogni risposta è controllata da uno script, mai da un altro modello. Per ogni modello misura velocità, token, energia della GPU e accuratezza (test superati).

- Esercizi in [esercizi/](esercizi/), scelti per separare i modelli: ogni consegna ha casi limite precisi e spesso si scosta apposta dalla versione nota del problema.
  - 04 conta parole (qualsiasi alfabeto), 07 numeri romani (solo forma standard), 08 cache LRU, 09 fusione di intervalli, 10 valutatore di espressioni;
  - 11 giorni lavorativi con le festività italiane (Pasquetta, 2 giugno sospeso 1990-2000, 4 ottobre dal 2026), indipendente dal fuso orario;
  - 12 parser CSV con virgolette, a capo nei campi ed errori con riga e colonna esatte;
  - 13 macchina a stati di un ciclo macchina (allarme da confermare, ripresa nello stato di prima, allarme automatico);
  - 14 diff di righe con script minimo deterministico e un formato a blocchi simile, ma non uguale, a `diff -u`;
  - non di codice: 15 estrazione in JSON da un rapporto d'intervento scritto di fretta, 16 scelta della prima chiamata tra 5 tool descritti con schema JSON, 17 istruzioni in testo con vincoli contati (punti, parole massime, parole vietate e obbligatorie), 18 OEE di un turno da una tabella di eventi e una di produzione. Dati tutti inventati.

  01, 02, 03, 05 e 06, superati da tutti i modelli provati, sono stati tolti (restano nella storia git); i numeri non sono stati riassegnati.
- Modelli e parametri in [bench/modelli.json](bench/modelli.json).
- Risultati in [risultati/](risultati/): un `.jsonl` per esecuzione, le risposte dei modelli (in `risultati/codice/`, anche quelle in json e testo) e [risultati/riepilogo.md](risultati/riepilogo.md).
- PC di prova in [note/hardware.md](note/hardware.md), messa a punto di Inkling su llama.cpp in [note/inkling-llamacpp.md](note/inkling-llamacpp.md).

## Requisiti

Node 23.6 o più recente (testato con Node 24): è la prima versione con `--test-isolation`, che il banco usa per lanciare i test (nella linea 22 esiste solo `--experimental-test-isolation`). Nessuna dipendenza: Node esegue direttamente i file `.ts` e ha già un test runner incluso.

Per i modelli: Ollama, il server di llama.cpp (`llama serve`) o una chiave API in `.env` (per Google AI Studio `GEMINI_API_KEY=...`; il file `.env` è nel `.gitignore`).

## Uso

```sh
npm run bench -- --model qwen3.5:4b                # un modello, tutti gli esercizi
npm run bench -- --model qwen3.5:4b --esercizi 2   # solo i primi 2 esercizi
npm run bench -- --tutti                           # tutti i modelli non ancora eseguiti
npm run bench -- --model qwen3:8b --forza          # riesegue anche se già fatto
npm test                                           # test del banco
npm run bench:verifica                             # le risposte giuste scritte a mano passano, quelle sbagliate falliscono
npm run bench:riepilogo                            # rigenera risultati/riepilogo.md dai .jsonl, senza chiamare modelli
```

Un modello già eseguito con le stesse impostazioni (configurazione, parametri, prompt, esercizi) viene saltato. Per provarne uno nuovo basta aggiungerlo a `bench/modelli.json` e lanciare `--tutti`.

## Come funziona

Ogni esercizio dichiara in `esercizio.json` il formato della risposta: `codice`, `json` o `testo`. Il modello riceve la consegna (più la firma per il codice) e deve rispondere con un blocco recintato del formato: ```` ```ts ````, ```` ```json ```` o ```` ```text ````. Il blocco è obbligatorio anche per json e testo: senza blocco l'esercizio non è superato. Il banco fa una sola chiamata in streaming, estrae il primo blocco del formato, lo salva (`NN.ts`, `NN.json`, `NN.txt`) e lancia i test una volta, in una sandbox: permission model di Node, lettura della sola cartella dell'esercizio e della risposta, nessuna chiave nell'ambiente. La rete non è bloccata. I test del codice importano il modulo; quelli di json e testo leggono il file e controllano campi, valori e conteggi con `node:assert`.

Ogni esercizio ha risposte scritte a mano: `riferimento.ts` e `firma.ts` per il codice, `riferimento.json`/`.txt` e una o più `sbagliata-*.json`/`.txt` per gli altri. `npm run bench:verifica` controlla che la giusta passi e ogni sbagliata fallisca.

Parametri uguali per tutti: `temperature` 0, `max_tokens` 8192, `reasoning_effort` "medium".

Misure per esercizio: tempo totale, tempo al primo token (ragionamento compreso), token in ingresso e in uscita dall'usage dell'API, token/s = token in uscita / (totale − primo token), energia della GPU (nvidia-smi ogni 500 ms, integrata sulla chiamata), superato sì/no. Per ogni modello anche la potenza a riposo e la velocità di lettura di un prompt di circa 4000 token.

Per i modelli via API conta anche il costo: la somma di `usage.cost` riportato dall'API (OpenRouter) su tutte le chiamate del run, prompt lungo compreso. Se l'API non lo riporta (es. Gemini) la cella resta "–": il costo non viene mai stimato da un listino.

## Riepilogo

[risultati/riepilogo.md](risultati/riepilogo.md) viene rigenerato per intero da tutti i `.jsonl` a fine di ogni `npm run bench`, oppure a mano con `npm run bench:riepilogo`. Ha due leaderboard:

- modelli locali: superati (totale, codice, non codice), tok/s, primo token, tempo, token in uscita, Wh, riposo, prompt tok/s, troncati; ordinati per superati e poi tempo medio;
- modelli via API: superati (totale, codice, non codice), troncati, token in uscita e di ragionamento medi, tempo medio, costo totale e costo per esercizio superato; ordinati per superati e poi costo per superato.

Le classifiche seguono i superati totali. Sotto le due leaderboard, "Esiti per esercizio" mostra per ogni modello quali esercizi ha superato (✓), fallito (✗) o non eseguito (–), con gli esercizi raggruppati per categoria.

Per ogni modello vale l'ultima esecuzione con l'impronta di confronto corrente: parametri di chiamata, esercizi, versione del prompt (dal campo `confronto` dei `.jsonl`; i file più vecchi lo ricavano dalle loro righe). Le esecuzioni con un'impronta diversa, per esempio con meno esercizi o un altro `max_tokens`, restano visibili in fondo, in sezioni separate.

Un modello alla volta: il banco scarica i modelli di Ollama prima e dopo, e controlla che il server llama.cpp sia spento quando usa Ollama (e viceversa). Ollama deve avere `OLLAMA_CONTEXT_LENGTH=16384` nel servizio: il banco lo controlla.

## Prossimi passi

Stato al 23 novembre 2026: eseguiti i modelli locali qwen3.5:4b, qwen3:8b, gemma4:e4b, qwen3.5:9b e inkling2mini (vedi [risultati/riepilogo.md](risultati/riepilogo.md)).

1. Rieseguire tutti i modelli sui 13 esercizi attuali con il prompt v2: con i 4 esercizi non di codice sono cambiati esercizi e versione del prompt, e i risultati precedenti finiscono tra le "altre impronte" del riepilogo.
2. Eseguire i Gemini (gemini-3.5-flash-lite, gemini-3.8-flash) con `npm run bench -- --tutti`, che salta i modelli già fatti: 14 chiamate ciascuno (prompt lungo e 13 esercizi) con 15 s di pausa, sotto il tetto di 15; dopo un 429 o un 503 (servizio sovraccarico) il banco si ferma e passa al modello successivo.
3. Solo dopo aver provato tutti i modelli, valutare i parametri. Finché non sono stati provati tutti restano `max_tokens` 8192 e `reasoning_effort` "medium", così i risultati sono confrontabili. Con i modelli locali diverse risposte agli esercizi 07, 08 e 10 arrivano a 8192 token senza codice (finish_reason `length`): 2 su 10 con qwen3.5:4b, 3 con qwen3:8b e qwen3.5:9b, 1 con inkling2mini (il 10), nessuna con gemma4:e4b. Le opzioni sono alzare `max_tokens` o provare `reasoning_effort` "low". Cambiare un parametro cambia l'impronta, quindi tutti i modelli vanno rieseguiti.

## Origine

Nato sul branch `bench/v0` di [harness-giocattolo](https://github.com/Chiaf1/harness-giocattolo), dove resta la storia dei primi commit (e delle prove su Inkling). Nei `.jsonl` dei primi risultati il campo `versione_programma.commit` si riferisce a quella repo.
