# Riepilogo del banco

Generato dai file `risultati/*.jsonl` con `npm run bench:riepilogo` (e a ogni `npm run bench`): non modificare a mano.
Il dettaglio (ogni chiamata, hardware, parametri) è nei file `risultati/<data>-<modello>.jsonl`.

Una riga per modello: la sua ultima esecuzione con l'impronta di confronto (parametri di chiamata, esercizi, versione del prompt).
Le esecuzioni con un'impronta diversa da quella corrente sono in fondo, separate.

- tok/s medi: media sugli esercizi di token in uscita / (tempo totale − tempo al primo token).
- Primo token: primo frammento in streaming, ragionamento compreso.
- Wh: energia della sola GPU (nvidia-smi ogni 500 ms), integrata sulla durata di ogni chiamata; il riposo non è sottratto.
- Prompt tok/s: token in ingresso / tempo al primo token su un prompt lungo (max_tokens 1).
- Superati: totale; Codice e Non codice sono gli stessi superati divisi per categoria (formato codice, oppure json e testo). Le classifiche seguono il totale. Il dettaglio di ogni esercizio è in "Esiti per esercizio".
- Troncati: risposte con finish_reason "length".
- Costo: somma di `usage.cost` riportato dall'API su tutte le chiamate del run (prompt lungo compreso); "–" se l'API non lo riporta, mai stimato. Costo per superato = costo totale / esercizi superati.

## Impronta corrente

temperature 0, max_tokens 32768, reasoning_effort medium; 13 esercizi (04-conta-parole … 18-oee-turno); prompt v2 (chiave 30774964e9df33c0)

### Modelli locali

Nessuna esecuzione.

### Modelli via API

| Modello | Data | Superati | Codice | Non codice | Troncati | Token uscita medi | Token ragionamento medi | Tempo medio (s) | Costo totale ($) | Costo per superato ($) | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| deepseek-v4.1-flash | 2026-11-25T21-42-54 | 11/13 | 7/9 | 4/4 | 2 | 9269 | 8852 | 33,2 | 0,0711 | 0,00646 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Più provider: OpenRouter sceglie, i tempi possono variare tra un run e l'altro. |
| inkling-2-mini | 2026-11-25T21-42-54 | 10/13 | 6/9 | 4/4 | 3 | 9634 | 9230 | 20,9 | 0,0386 | 0,00386 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Stesso modello di inkling2mini locale (IQ4_NL su llama.cpp): confronto quantizzato vs servito. Più provider a prezzi diversi, OpenRouter sceglie. |

### Esiti per esercizio

✓ superato, ✗ fallito, – non eseguito. Codice: 04 conta-parole, 07 numeri-romani, 08 cache-lru, 09 fondi-intervalli, 10 valuta-espressioni, 11 giorni-lavorativi, 12 csv, 13 ciclo-macchina, 14 diff-righe. Non codice: 15 rapporto-intervento (json), 16 scelta-tool (json), 17 vincoli-testo (testo), 18 oee-turno (json).

| Modello | Codice | 04 | 07 | 08 | 09 | 10 | 11 | 12 | 13 | 14 | Non codice | 15 | 16 | 17 | 18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| deepseek-v4.1-flash | 7/9 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | 4/4 | ✓ | ✓ | ✓ | ✓ |
| inkling-2-mini | 6/9 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | 4/4 | ✓ | ✓ | ✓ | ✓ |

## Altre impronte

Esecuzioni non confrontabili con quelle sopra.

### temperature 0, max_tokens 8192, reasoning_effort medium; 13 esercizi (04-conta-parole … 18-oee-turno); prompt v2 (chiave 3c2aead41058eef7)

#### Modelli via API

| Modello | Data | Superati | Codice | Non codice | Troncati | Token uscita medi | Token ragionamento medi | Tempo medio (s) | Costo totale ($) | Costo per superato ($) | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| glm-5.3-flash | 2026-11-24T23-28-14 | 11/13 | 8/9 | 3/4 | 0 | 960 | 458 | 5,0 | 0,0064 | 0,00058 | Remoto: energia non misurata; primo token e token/s comprendono la rete. |
| inkling-2-mini | 2026-11-24T23-29-21 | 9/13 | 5/9 | 4/4 | 4 | 3892 | 3622 | 18,6 | 0,0162 | 0,00180 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Stesso modello di inkling2mini locale (IQ4_NL su llama.cpp): confronto quantizzato vs servito. Più provider a prezzi diversi, OpenRouter sceglie. |
| deepseek-v4.1-flash | 2026-11-24T23-33-25 | 9/13 | 5/9 | 4/4 | 4 | 4218 | 3980 | 22,0 | 0,0347 | 0,00385 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Più provider: OpenRouter sceglie, i tempi possono variare tra un run e l'altro. |
| minimax-m3 | 2026-11-24T23-38-45 | 8/13 | 4/9 | 4/4 | 4 | 4334 | 4002 | 31,1 | 0,0782 | 0,00978 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Ragiona molto: occhio ai token in uscita. |
| qwen3-coder-next | 2026-11-24T23-38-13 | 2/13 (incompleto) | 2/9 | 0/4 | 0 | 496 | 0 | 7,4 | 0,0024 | 0,00120 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Modello di coding non ragionante: reasoning_effort probabilmente ignorato. nessun ragionamento osservato: reasoning_effort ignorato o modello che non ragiona interrotto: HTTP 429 (limite di richieste): HTTP 429: {"error":{"message":"Provider returned error","code":429,"metadata":{"raw":"qwen/qwen3-coder-next is temporarily rate-limited upstream. Please retry shortly, or add your own provider key to use your own limits: https://openrouter.ai/workspaces/default/byok","provider_name":"Parasail","is_byok":false,"provider_error_code":"429","limit_source":"upstream_provider_shared_pool","remedy_hint":"Retry shortly, add your own provider key to use your own limits (https://openrouter.ai/workspaces/default/byo |

### temperature 0, max_tokens 8192, reasoning_effort medium; 1 esercizio (01-somma-pari); prompt v1 (chiave c8d4ae85c9b3c857)

#### Modelli locali

| Modello | Data | Superati | Codice | Non codice | tok/s medi | Primo token medio (s) | Tempo medio (s) | Token uscita medi | Wh totali | Wh medi | Riposo (W) | Prompt tok/s (token) | Ragiona | Troncati | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gemma4:e4b | 2026-11-24T21-52-09 | 1/1 | 1/1 | – | 158,4 | 0,12 | 5,6 | 870 | 0,318 | 0,3181 | 6,2 | 1814 (4143) | sì | 0 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |

### temperature 0, max_tokens 8192, reasoning_effort medium; 10 esercizi (01-somma-pari … 10-valuta-espressioni); prompt v1 (chiave 014924cc6977a609)

#### Modelli locali

| Modello | Data | Superati | Codice | Non codice | tok/s medi | Primo token medio (s) | Tempo medio (s) | Token uscita medi | Wh totali | Wh medi | Riposo (W) | Prompt tok/s (token) | Ragiona | Troncati | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| inkling2mini | 2026-11-23T21-27-33 | 9/10 | 9/10 | – | 19,0 | 5,96 | 96,3 | 1676 | 21,587 | 2,1587 | 6,1 | 59 (4587) | sì | 1 | La CPU lavora (esperti di 22 layer su 24 in RAM) e la sua energia non è misurata. Il riposo è misurato con il modello già caricato. Ragionamento in reasoning_content. |
| gemma4:e4b | 2026-11-23T20-43-22 | 8/10 | 8/10 | – | 150,1 | 0,13 | 11,8 | 1728 | 7,103 | 0,7103 | 2,8 | 4210 (4142) | sì | 0 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |
| qwen3.5:4b | 2026-11-22T20-58-24 | 7/10 | 7/10 | – | 98,0 | 0,20 | 36,7 | 3545 | 21,967 | 2,1967 | 6,9 | 2758 (3971) | sì | 2 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |
| qwen3.5:9b | 2026-11-23T20-45-59 | 7/10 | 7/10 | – | 44,9 | 0,32 | 116,4 | 5204 | 56,769 | 5,6769 | 3,8 | 1573 (3972) | sì | 3 | Parte del modello gira in CPU (quota registrata in ogni riga): l'energia della CPU non è misurata. Ollama: reasoning_effort accende il ragionamento; livelli non verificati. |
| qwen3:8b | 2026-11-22T21-20-11 | 6/10 | 6/10 | – | 50,9 | 0,35 | 83,7 | 4036 | 46,260 | 4,6260 | 7,3 | 1678 (5168) | sì | 3 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |

#### Modelli via API

| Modello | Data | Superati | Codice | Non codice | Troncati | Token uscita medi | Token ragionamento medi | Tempo medio (s) | Costo totale ($) | Costo per superato ($) | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| glm-5.3-flash | 2026-11-24T20-40-24 | 9/10 | 9/10 | – | 0 | 265 | 4 | 2,0 | 0,0020 | 0,00022 | Remoto: energia non misurata; primo token e token/s comprendono la rete. |
| qwen3-coder-next | 2026-11-24T20-58-18 | 8/10 | 8/10 | – | 0 | 368 | 0 | 5,8 | 0,0040 | 0,00050 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Modello di coding non ragionante: reasoning_effort probabilmente ignorato. nessun ragionamento osservato: reasoning_effort ignorato o modello che non ragiona |
| inkling-2-mini | 2026-11-24T20-54-43 | 8/10 | 8/10 | – | 2 | 2175 | 2016 | 4,8 | 0,0085 | 0,00106 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Stesso modello di inkling2mini locale (IQ4_NL su llama.cpp): confronto quantizzato vs servito. Più provider a prezzi diversi, OpenRouter sceglie. |
| deepseek-v4.1-flash | 2026-11-24T20-55-59 | 8/10 | 8/10 | – | 2 | 2394 | 2248 | 11,7 | 0,0165 | 0,00206 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Più provider: OpenRouter sceglie, i tempi possono variare tra un run e l'altro. |
| minimax-m3 | 2026-11-24T20-59-33 | 8/10 | 8/10 | – | 1 | 2631 | 1825 | 67,4 | 0,0499 | 0,00624 | Remoto: energia non misurata; primo token e token/s comprendono la rete. Ragiona molto: occhio ai token in uscita. |

### temperature 0, max_tokens 8192, reasoning_effort medium; 2 esercizi (01-somma-pari … 02-palindromo); prompt v1 (chiave d8af6e91edba20b2)

#### Modelli locali

| Modello | Data | Superati | Codice | Non codice | tok/s medi | Primo token medio (s) | Tempo medio (s) | Token uscita medi | Wh totali | Wh medi | Riposo (W) | Prompt tok/s (token) | Ragiona | Troncati | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| qwen3.5:4b | 2026-11-22T20-53-01 | 2/2 | 2/2 | – | 96,1 | 0,21 | 30,5 | 2915 | 3,481 | 1,7407 | 6,7 | 2753 (3971) | sì | 0 | Ollama: reasoning_effort accende il ragionamento (con "none" lo spegne); non è verificato che medium sia diverso da low o high per questo modello. |
