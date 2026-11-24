export function contaParole(testo: string): Record<string, number> {
  if (!testo) {
    return {};
  }

  // Espressione regolare per estrarre parole: sequenze di lettere (qualsiasi alfabeto) o cifre
  // \p{L} = qualsiasi lettera Unicode, \p{N} = qualsiasi cifra Unicode
  // con la flag 'u' per supportare Unicode
  const regex = /\p{L}[\p{L}\p{N}]*/gu;
  
  const parole = testo.match(regex);
  
  if (!parole) {
    return {};
  }

  const conteggio: Record<string, number> = {};
  
  for (const parola of parole) {
    const parolaMinuscola = parola.toLowerCase();
    conteggio[parolaMinuscola] = (conteggio[parolaMinuscola] || 0) + 1;
  }
  
  return conteggio;
}
