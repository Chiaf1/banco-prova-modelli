# Diff di righe

Scrivi `diffRighe(vecchio, nuovo, contesto)` che confronta due testi riga per riga e restituisce le differenze come stringa, nel formato descritto qui. Il formato somiglia a quello "unified" di `diff -u` ma **non è lo stesso**: segui queste regole, non quelle di GNU diff. `contesto` vale 1 se non viene passato.

**Righe.** Un testo si divide in righe su `\n`. Se il testo finisce con `\n` quell'ultimo `\n` chiude l'ultima riga e non ne apre una nuova: `"a"` e `"a\n"` hanno le stesse righe, `""` non ha righe, `"\n"` ha una riga vuota. Il `\r` è un carattere come gli altri.

**Script di modifica.** Le differenze sono una sequenza di operazioni sulle righe: uguale, cancella (una riga del vecchio), inserisci (una riga del nuovo). Lo script deve avere il **minimo numero di cancellazioni più inserimenti**. Tra gli script minimi scegli quello costruito così, dall'inizio dei due testi:

1. se la riga corrente del vecchio e quella del nuovo sono uguali, sono uguali (avanzano entrambe);
2. altrimenti, se cancellando la riga del vecchio si può ancora arrivare a uno script minimo, cancellala;
3. altrimenti inserisci la riga del nuovo.

**Blocchi.** Ogni gruppo di cancellazioni e inserimenti consecutivi va in un blocco insieme a un massimo di `contesto` righe uguali prima e `contesto` dopo. Se tra due gruppi ci sono al massimo `2 * contesto` righe uguali, i due gruppi stanno nello stesso blocco (con tutte le righe uguali in mezzo).

Ogni blocco inizia con l'intestazione `@@ -A,N +B,M @@`:

- `N` e `M` sono quante righe del vecchio (uguali e cancellate) e del nuovo (uguali e inserite) ci sono nel blocco. Si scrivono **sempre**, anche quando valgono 1 o 0.
- `A` è il numero (da 1) della prima riga del vecchio nel blocco. Se il blocco non contiene righe del vecchio (`N` = 0), `A` è il numero che avrebbe la riga del vecchio subito dopo il blocco, cioè le righe del vecchio prima del blocco più 1. Lo stesso per `B` con il nuovo.

Seguono le righe del blocco nell'ordine dello script, con un prefisso: spazio per le uguali, `-` per le cancellate, `+` per le inserite. Ogni riga dell'uscita, intestazioni comprese, finisce con `\n`. I blocchi si scrivono uno dopo l'altro, senza intestazioni di file. Se i testi hanno le stesse righe il risultato è `""`.

`contesto` deve essere un intero ≥ 0, altrimenti lancia un `RangeError`.

Esempio: `diffRighe("a\nb\nc\n", "a\nx\nc\n")` →

```
@@ -1,3 +1,3 @@
 a
-b
+x
 c
```
