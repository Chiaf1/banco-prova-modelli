# Rapporto d'intervento

Il rapporto qui sotto è stato scritto di fretta da un tecnico dell'assistenza. Persone, aziende, macchine e codici sono inventati.

```
RAPP. N° ri-2026-0412      lugo 03.11.26 (mart.)

cliente: Ventura Stampi srl, stabilimento di via dei Tigli (referente sig. Ventura jr)
macch. pressa idraulica PH-250, matr. vs-88213/b

arrivati io (Rinaldi) e Marchetti, 38 km da sede, iniziato dalle 8 e mezza, alle 12:15 pausa pranzo.
Gualtieri dall'ufficio ha chiamato x sapere se serviva il kit guarnizioni KG-118: l'avevo
portato ma alla fine NON serviva, riportato in magazzino.
problema: rumore forte lato pompa + perdite pressione. smontato gruppo pompa, cuscinetti
andati -> montati 2 cuscinetti BR-6204. cinghia consumata, sostituita (1x CD-5520).
ripreso alle 13.45, quadro el.: 3 fusibili FU-010 bruciati, ne avevo solo 2 -> montati quei 2,
il terzo circuito (luci) lasciato fuori.
finito alle quattro meno un quarto del pomeriggio. la pressa gira, pressione ok,
manca il fusibile delle luci: torno io appena arriva il pezzo.
rapporto scritto il giorno dopo (4/11).
```

Estrai i dati in un oggetto JSON con **esattamente** questi campi:

- `numero_rapporto` (stringa): il numero del rapporto in maiuscolo, per esempio `"RI-2025-0001"`.
- `data_intervento` (stringa): il giorno dell'intervento, nel formato `AAAA-MM-GG`.
- `cliente` (stringa): la ragione sociale del cliente con la forma societaria, come è scritta nel rapporto.
- `macchina` (oggetto): `modello` e `matricola` (stringhe), in maiuscolo.
- `tecnici` (array di stringhe): i cognomi dei tecnici che hanno lavorato all'intervento, in ordine alfabetico.
- `minuti_lavoro` (intero): i minuti di lavoro sulla macchina, pause escluse.
- `km_trasferta` (intero): i km della trasferta, andata e ritorno, sapendo che il ritorno è uguale all'andata.
- `ricambi` (array): i ricambi **montati**, nell'ordine in cui il rapporto li nomina, ognuno come `{ "codice": stringa, "quantita": intero }`. I ricambi portati ma non montati non vanno messi.
- `esito` (stringa): `"risolto"` se il problema è risolto del tutto e non serve tornare, `"parziale"` se la macchina funziona ma resta qualcosa da fare, `"non_risolto"` se la macchina non funziona.
- `ritorno_previsto` (booleano): se il rapporto dice che serve un altro intervento.
