# Valuta espressioni

Scrivi `valuta(espressione)` che calcola il valore di un'espressione aritmetica scritta come stringa.

- Numeri: interi o decimali con il punto (`3`, `0.5`, `2.`, `.5`). Niente notazione esponenziale.
- Operatori binari `+`, `-`, `*`, `/`, con la precedenza usuale (`*` e `/` prima di `+` e `-`) e associativi a sinistra: `8 - 3 - 2` vale 3, `8 / 4 / 2` vale 1.
- Meno e più unari, anche ripetuti e dopo un operatore: `-3`, `2 * -3`, `--2`, `-(1 + 2)`, `+4`.
- Parentesi tonde, anche annidate.
- Gli spazi si ignorano, ma non possono stare dentro un numero (`"1 2"` è un errore).
- La divisione segue JavaScript: `1 / 0` vale `Infinity`.
- Espressioni non valide (vuota, operatore mancante o in più, parentesi non bilanciate, caratteri sconosciuti, numero malformato come `1.2.3`) fanno lanciare un `SyntaxError`.

Non usare `eval`, `new Function` o altri modi di eseguire la stringa come codice.
