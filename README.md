# banco-prova-modelli

Banco minimo per mettere alla prova modelli di linguaggio, locali e via API, sugli stessi 10 esercizi di coding in TypeScript. Per ogni modello misura velocità, token, energia della GPU e accuratezza (test superati).

- Esercizi in [esercizi/](esercizi/), di difficoltà crescente.
- Modelli e parametri in [bench/modelli.json](bench/modelli.json).
- Risultati in [risultati/](risultati/): un `.jsonl` per esecuzione, il codice generato e [risultati/riepilogo.md](risultati/riepilogo.md).
- PC di prova in [note/hardware.md](note/hardware.md), messa a punto di Inkling su llama.cpp in [note/inkling-llamacpp.md](note/inkling-llamacpp.md).

## Requisiti

Node 22.18 o più recente (testato con Node 24). Nessuna dipendenza: Node esegue direttamente i file `.ts` e ha già un test runner incluso.

Per i modelli: Ollama, il server di llama.cpp (`llama serve`) o una chiave API in `.env` (per Google AI Studio `GEMINI_API_KEY=...`; il file `.env` è nel `.gitignore`).

## Uso

```sh
npm run bench -- --model qwen3.5:4b                # un modello, tutti gli esercizi
npm run bench -- --model qwen3.5:4b --esercizi 2   # solo i primi 2 esercizi
npm run bench -- --tutti                           # tutti i modelli non ancora eseguiti
npm run bench -- --model qwen3:8b --forza          # riesegue anche se già fatto
npm test                                           # test del banco
npm run bench:verifica                             # i test degli esercizi passano con le soluzioni di riferimento
```

Un modello già eseguito con le stesse impostazioni (configurazione, parametri, prompt, esercizi) viene saltato. Per provarne uno nuovo basta aggiungerlo a `bench/modelli.json` e lanciare `--tutti`.

## Come funziona

Per ogni esercizio il modello riceve consegna e firma e risponde con il codice. Il banco fa una sola chiamata in streaming, estrae il primo blocco ```` ```ts ````, lo salva e lancia i test una volta, in una sandbox: permission model di Node, lettura della sola cartella dell'esercizio, nessuna chiave nell'ambiente. La rete non è bloccata.

Parametri uguali per tutti: `temperature` 0, `max_tokens` 8192, `reasoning_effort` "medium".

Misure per esercizio: tempo totale, tempo al primo token (ragionamento compreso), token in ingresso e in uscita dall'usage dell'API, token/s = token in uscita / (totale − primo token), energia della GPU (nvidia-smi ogni 500 ms, integrata sulla chiamata), superato sì/no. Per ogni modello anche la potenza a riposo e la velocità di lettura di un prompt di circa 4000 token.

Un modello alla volta: il banco scarica i modelli di Ollama prima e dopo, e controlla che il server llama.cpp sia spento quando usa Ollama (e viceversa). Ollama deve avere `OLLAMA_CONTEXT_LENGTH=16384` nel servizio: il banco lo controlla.

## Prossimi passi

Stato al 22 novembre 2026: eseguiti qwen3.5:4b e qwen3:8b (vedi [risultati/riepilogo.md](risultati/riepilogo.md)).

1. Eseguire gli altri modelli: `npm run bench -- --tutti` salta quelli già fatti.
   - Prima i modelli Ollama (gemma4:e4b, qwen3.5:9b), con il server llama.cpp spento.
   - Poi Inkling (inkling2mini): `llama serve` avviato a mano con il comando in `bench/modelli.json`; il banco scarica Ollama e controlla che sia vuoto.
   - Poi i Gemini (gemini-3.5-flash-lite, gemini-3.8-flash): 11 chiamate ciascuno con 15 s di pausa, sotto il tetto di 15; dopo un 429 il banco si ferma.
2. Solo dopo aver provato tutti i modelli, valutare i parametri. Finché non sono stati provati tutti restano `max_tokens` 8192 e `reasoning_effort` "medium", così i risultati sono confrontabili. Con i primi due modelli molte risposte agli esercizi 07, 08 e 10 arrivano a 8192 token senza codice (finish_reason `length`). Le opzioni sono alzare `max_tokens` o provare `reasoning_effort` "low". Cambiare un parametro cambia l'impronta, quindi tutti i modelli vanno rieseguiti.

## Origine

Nato sul branch `bench/v0` di [harness-giocattolo](https://github.com/Chiaf1/harness-giocattolo), dove resta la storia dei primi commit (e delle prove su Inkling). Nei `.jsonl` dei primi risultati il campo `versione_programma.commit` si riferisce a quella repo.
