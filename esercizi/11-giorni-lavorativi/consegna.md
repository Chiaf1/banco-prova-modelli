# Giorni lavorativi

Scrivi `giorniLavorativi(da, a)` che conta i giorni lavorativi tra due date scritte come `"AAAA-MM-GG"`, **estremi compresi**.

- Un giorno è lavorativo se cade dal lunedì al venerdì e non è una festività nazionale italiana.
- Festività (calendario gregoriano):
  - 1 gennaio, 6 gennaio, 25 aprile, 1 maggio, 15 agosto, 1 novembre, 8 dicembre, 25 dicembre, 26 dicembre;
  - lunedì dell'Angelo (Pasquetta), il giorno dopo la Pasqua cattolica, da calcolare per ogni anno;
  - 2 giugno, ma **non** negli anni dal 1990 al 2000 compresi (in quegli anni la festa era spostata alla domenica);
  - 4 ottobre, **solo dal 2026** in poi.
- Se due festività cadono lo stesso giorno, il giorno conta una volta sola.
- Se `da` è dopo `a` il risultato è negativo: `giorniLavorativi(a, da)` con il segno meno. Se `da` e `a` coincidono il risultato è 1 o 0.
- Le date valide vanno dal `1990-01-01` al `2199-12-31` e devono avere esattamente la forma `AAAA-MM-GG` (con gli zeri: `2024-04-01`, non `2024-4-1`). Una data fuori da questo intervallo, scritta in un'altra forma o inesistente (`2023-02-29`, `2024-04-31`, `2024-13-01`) fa lanciare un `RangeError`.
- Il risultato non deve dipendere dal fuso orario del sistema su cui gira il codice.

Esempio: dal `2024-03-25` al `2024-04-05` i giorni lavorativi sono 9 (il 1 aprile 2024 è Pasquetta).
