# AGENTS.md

## Scopo della repo

Banco minimo che fa risolvere 10 esercizi di coding a ogni modello e misura velocità, token, energia della GPU e accuratezza. Deve restare piccolo: niente dipendenze, ogni numero del riepilogo esce dal codice.

## Comandi

Nessuna dipendenza e nessun `npm install`: Node (≥ 22.18) esegue direttamente i `.ts` togliendo i tipi, e i test usano `node:test`.

```sh
npm test                                          # test del banco (test/bench.test.ts)
npm run bench:verifica                            # i test degli esercizi passano con riferimento.ts e falliscono con firma.ts
npm run bench -- --model qwen3.5:4b --esercizi 2  # prova veloce su un modello
node --test --test-name-pattern="whIntegrati" test/bench.test.ts
```

## File

- `bench/modelli.json`: modelli, parametri di avvio e di chiamata, prompt lungo.
- `bench/calcoli.ts`: funzioni pure (estrazione del codice, medie, token/s, Wh, riepilogo), testate in `test/bench.test.ts`.
- `bench/api.ts`: chiamata in streaming a un endpoint compatibile OpenAI.
- `bench/banco.ts`: il programma; `energia.ts` (nvidia-smi), `sistema.ts` (hardware, Ollama), `esegui.ts` (test in sandbox), `prompt.ts` (testi mandati ai modelli).
- `esercizi/NN-nome/`: `consegna.md`, `firma.ts`, `soluzione.test.ts`, `riferimento.ts`. I loro test non entrano in `npm test`.
- `risultati/`: scritti dal banco, non modificarli a mano.
- `note/`: scheda del PC di prova (il banco la confronta a ogni esecuzione) e messa a punto di Inkling.

## Regole

- Se cambi un testo in `bench/prompt.ts` alza `VERSIONE_PROMPT`. Se cambi un esercizio lancia `npm run bench:verifica`.
- La chiave Gemini sta in `.env` (`GEMINI_API_KEY`): non stamparla e non metterla nella repo.
- Google free tier: niente nuovi tentativi dopo un 429 o un 503 (il banco si ferma), pausa tra le chiamate e tetto di chiamate in `modelli.json`.
- Se cambia l'hardware o una versione (driver, Ollama, llama.cpp) aggiorna `note/hardware.md`: le misure vecchie e nuove non sono più confrontabili alla pari.

## Vincoli del type stripping di Node

- Import tra file locali con estensione `.ts` esplicita (`./calcoli.ts`).
- Solo sintassi TypeScript cancellabile: niente `enum`, `namespace`, parameter properties nei costruttori.
- I tipi non vengono verificati: un errore di tipo non fa fallire né il banco né i test.
