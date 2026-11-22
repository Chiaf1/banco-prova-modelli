# Riepilogo del banco

Una riga per modello: l'ultima esecuzione. Scritto da `npm run bench`, non modificare a mano.
Il dettaglio (ogni chiamata, hardware, parametri) è nei file `risultati/<data>-<modello>.jsonl`.

- tok/s medi: media sugli esercizi di token in uscita / (tempo totale − tempo al primo token).
- Primo token: primo frammento in streaming, ragionamento compreso.
- Wh: energia della sola GPU (nvidia-smi ogni 500 ms), integrata sulla durata di ogni chiamata; il riposo non è sottratto.
- Prompt tok/s: token in ingresso / tempo al primo token su un prompt lungo (max_tokens 1).
- Troncati: risposte con finish_reason "length".

| Modello | Data | Superati | tok/s medi | Primo token medio (s) | Tempo medio (s) | Token uscita medi | Wh totali | Wh medi | Riposo (W) | Prompt tok/s (token) | Ragiona | Troncati | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| qwen3.5:4b | 2026-11-22T20-58-24 | 7/10 | 98,0 | 0,20 | 36,7 | 3545 | 21,967 | 2,1967 | 6,9 | 2758 (3971) | sì | 2 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |
| qwen3:8b | 2026-11-22T21-20-11 | 6/10 | 50,9 | 0,35 | 83,7 | 4036 | 46,260 | 4,6260 | 7,3 | 1678 (5168) | sì | 3 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |
