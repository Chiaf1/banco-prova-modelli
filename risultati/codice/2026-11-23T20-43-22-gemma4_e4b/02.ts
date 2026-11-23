export function palindromo(testo: string): boolean {
  // 1. Normalizzazione e Filtraggio:
  // Converti in minuscolo e rimuovi tutti i caratteri che non sono lettere (a-z) o cifre (0-9).
  // Il regex /[^a-z0-9]/g trova tutti i caratteri che NON sono a-z o 0-9.
  const testoPulito = testo.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 2. Controllo Palindromo:
  // Un testo è palindromo se è uguale alla sua versione invertita.
  // split('') trasforma la stringa in un array di caratteri.
  // reverse() inverte l'array.
  // join('') ricombina l'array in una stringa.
  const testoInvertito = testoPulito.split('').reverse().join('');

  return testoPulito === testoInvertito;
}
