export function sommaPari(numeri: number[]): number {
  let somma = 0;
  
  for (const numero of numeri) {
    // Verifica se il numero è intero e pari
    if (Number.isInteger(numero) && numero % 2 === 0) {
      somma += numero;
    }
  }
  
  return somma;
}
