# AGENTS.md

## Scopo della repo

Banco minimo che fa risolvere 13 esercizi a ogni modello (9 di codice, 4 con risposta in JSON o in testo) e misura velocità, token, energia della GPU e accuratezza. Deve restare piccolo: niente dipendenze, ogni numero del riepilogo esce dal codice.

## Comandi

Nessuna dipendenza e nessun `npm install`: Node (≥ 23.6) esegue direttamente i `.ts` togliendo i tipi, e i test usano `node:test`.

```sh
npm test                                          # test del banco (test/bench.test.ts)
npm run bench:verifica                            # riferimento.* passa, firma.ts e sbagliata-*.* falliscono
npm run bench -- --model qwen3.5:4b --esercizi 2  # prova veloce su un modello
npm run bench:riepilogo                           # rigenera risultati/riepilogo.md dai .jsonl, senza chiamare modelli
node --test --test-name-pattern="whIntegrati" test/bench.test.ts
```

## File

- `bench/modelli.json`: modelli, parametri di avvio e di chiamata, prompt lungo.
- `bench/calcoli.ts`: funzioni pure (formati ed estrazione della risposta, medie, token/s, Wh, costo, chiave di confronto, riepilogo), testate in `test/bench.test.ts`.
- `bench/riepilogo.ts`: legge tutti i `.jsonl` e riscrive `risultati/riepilogo.md` (due leaderboard, locali e API, con i superati per categoria, più gli esiti per esercizio). Il banco lo chiama a fine esecuzione.
- `bench/api.ts`: chiamata in streaming a un endpoint compatibile OpenAI.
- `bench/banco.ts`: il programma; `energia.ts` (nvidia-smi), `sistema.ts` (hardware, Ollama), `esegui.ts` (test in sandbox), `prompt.ts` (testi mandati ai modelli), `verifica.ts` (`npm run bench:verifica`: le risposte giuste scritte a mano passano, le sbagliate falliscono).
- `esercizi/NN-nome/`: `esercizio.json` (`{ "formato": "codice" | "json" | "testo" }`, obbligatorio), `consegna.md`, `soluzione.test.ts` e le risposte scritte a mano. Codice: `firma.ts` e `riferimento.ts`. Json e testo: `riferimento.json`/`.txt` e almeno una `sbagliata-*.json`/`.txt`, ognuna con una regola violata. Il test legge la risposta da `process.env.SOLUZIONE`. I loro test non entrano in `npm test`.
- `risultati/`: scritti dal banco, non modificarli a mano. Il riepilogo si rifà con `npm run bench:riepilogo`.
- `note/`: scheda del PC di prova (il banco la confronta a ogni esecuzione) e messa a punto di Inkling.

## Regole

- Se cambi un testo in `bench/prompt.ts` alza `VERSIONE_PROMPT`. Se cambi un esercizio lancia `npm run bench:verifica`.
- La verifica è sempre uno script (`node:test`), mai un giudice LLM; la risposta deve stare nel blocco recintato del formato, senza tolleranze.
- Negli esercizi i dati sono inventati: niente dati reali di aziende o persone.
- La chiave Gemini sta in `.env` (`GEMINI_API_KEY`): non stamparla e non metterla nella repo.
- Il costo delle API viene solo da `usage.cost` nei `.jsonl`: se manca la cella è "–", mai stimarlo da prezzi scritti a mano.
- Google free tier: niente nuovi tentativi dopo un 429 o un 503 (il banco si ferma), pausa tra le chiamate e tetto di chiamate in `modelli.json`.
- Se cambia l'hardware o una versione (driver, Ollama, llama.cpp) aggiorna `note/hardware.md`: le misure vecchie e nuove non sono più confrontabili alla pari.

## Vincoli del type stripping di Node

- Import tra file locali con estensione `.ts` esplicita (`./calcoli.ts`).
- Solo sintassi TypeScript cancellabile: niente `enum`, `namespace`, parameter properties nei costruttori.
- I tipi non vengono verificati: un errore di tipo non fa fallire né il banco né i test.
