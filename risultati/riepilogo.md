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
| gemma4:e4b | 2026-11-23T20-43-22 | 8/10 | 150,1 | 0,13 | 11,8 | 1728 | 7,103 | 0,7103 | 2,8 | 4210 (4142) | sì | 0 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |
| qwen3.5:9b | 2026-11-23T20-45-59 | 7/10 | 44,9 | 0,32 | 116,4 | 5204 | 56,769 | 5,6769 | 3,8 | 1573 (3972) | sì | 3 | Parte del modello gira in CPU (quota registrata in ogni riga): l'energia della CPU non è misurata. Ollama: reasoning_effort accende il ragionamento; livelli non verificati. |
| inkling2mini | 2026-11-23T21-27-33 | 9/10 | 19,0 | 5,96 | 96,3 | 1676 | 21,587 | 2,1587 | 6,1 | 59 (4587) | sì | 1 | La CPU lavora (esperti di 22 layer su 24 in RAM) e la sua energia non è misurata. Il riposo è misurato con il modello già caricato. Ragionamento in reasoning_content. |
| glm-5.3-flash | 2026-11-24T20-40-24 | 9/10 | 242,7 | 0,66 | 2,0 | 265 | – | – | – | 4703 (4825) | in parte | 0 | Remoto: energia non misurata; primo token e token/s comprendono la rete. |
