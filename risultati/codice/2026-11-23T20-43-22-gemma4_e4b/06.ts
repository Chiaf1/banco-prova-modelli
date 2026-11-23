export function bilanciate(testo: string): boolean {
  const stack: string[] = [];
  
  // Mappa che associa la parentesi chiusa alla sua corrispondente parentesi aperta
  const mapping: { [key: string]: string } = {
    ')': '(',
    ']': '[',
    '}': '{'
  };

  for (const char of testo) {
    // 1. Se è una parentesi aperta, la spingiamo nello stack
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } 
    // 2. Se è una parentesi chiusa
    else if (char === ')' || char === ']' || char === '}') {
      // Se lo stack è vuoto, abbiamo una chiusura senza apertura corrispondente
      if (stack.length === 0) {
        return false;
      }
      
      // Togliamo l'elemento in cima allo stack
      const top = stack.pop();
      
      // Verifichiamo se l'elemento rimosso corrisponde alla parentesi attesa
      if (top !== mapping[char]) {
        return false; // Mismatch di tipo o ordine
      }
    }
    // 3. Altrimenti, ignoriamo il carattere
  }

  // Alla fine, lo stack deve essere vuoto affinché tutte le parentesi siano state chiuse
  return stack.length === 0;
}
