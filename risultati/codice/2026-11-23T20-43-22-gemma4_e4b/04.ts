/**
 * Conta le occorrenze di ogni parola in un testo dato.
 *
 * Una parola è definita come una sequenza di lettere (incluse quelle accentate) o cifre.
 * Il conteggio è case-insensitive.
 *
 * @param testo Il testo da analizzare.
 * @returns Un oggetto dove le chiavi sono le parole in minuscolo e i valori sono i loro conteggi.
 */
export function contaParole(testo: string): Record<string, number> {
  if (!testo) {
    return {};
  }

  // Regex per trovare sequenze di caratteri che sono lettere Unicode (\p{L}) o cifre (\d).
  // La 'u' flag è essenziale per supportare i caratteri Unicode (come le lettere accentate).
  const regex = /\p{L}+|\d+/gu;

  // Estrae tutte le parole dal testo. Se non ci sono corrispondenze, restituisce null.
  const paroleMatch = testo.match(regex);

  if (!paroleMatch) {
    return {};
  }

  const conteggio: Record<string, number> = {};

  for (const parola of paroleMatch) {
    // Normalizza la parola in minuscolo per garantire il conteggio case-insensitive
    const parolaNormalizzata = parola.toLowerCase();

    // Aggiorna il conteggio
    if (conteggio[parolaNormalizzata]) {
      conteggio[parolaNormalizzata] += 1;
    } else {
      conteggio[parolaNormalizzata] = 1;
    }
  }

  return conteggio;
}
