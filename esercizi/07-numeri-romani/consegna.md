# Numeri romani

Scrivi due funzioni.

`aRomano(n)`: converte un intero da 1 a 3999 nel numero romano in forma standard, con le sottrazioni `IV`, `IX`, `XL`, `XC`, `CD`, `CM` (per esempio 1994 → `"MCMXCIV"`). Se `n` non è un intero tra 1 e 3999 lancia un `RangeError`.

`daRomano(s)`: converte un numero romano in intero. Accetta solo la forma standard in lettere maiuscole, cioè esattamente le stringhe che `aRomano` può produrre. Per qualunque altra stringa (`"IIII"`, `"IC"`, `"VX"`, `"MMMM"`, `"iv"`, `""`, ...) lancia un `RangeError`.
