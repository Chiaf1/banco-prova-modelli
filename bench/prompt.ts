// Testi mandati ai modelli. Se cambi qualcosa qui, alza VERSIONE_PROMPT:
// entra nell'impronta e fa rieseguire i modelli già provati.
export const VERSIONE_PROMPT = 1;

export function promptEsercizio(consegna: string, firma: string): string {
  return `Risolvi l'esercizio seguente in TypeScript.

${consegna.trim()}

Firma da implementare (file firma.ts):

\`\`\`ts
${firma.trim()}
\`\`\`

Regole:
- Rispondi con un solo blocco di codice \`\`\`ts che contiene il modulo completo, con gli stessi export della firma.
- Il codice gira con Node 24 togliendo i tipi (type stripping): niente enum, namespace, parameter properties nei costruttori, niente import di pacchetti esterni.
- Il modulo verrà importato da test che non vedi.`;
}

const FRASI = [
  "Il fiume attraversa la valle lentamente e in primavera si gonfia per la neve che si scioglie sulle montagne.",
  "Nel mercato del sabato si trovano frutta di stagione, formaggi delle colline e pane cotto nel forno a legna.",
  "Una buona passeggiata in collina richiede scarpe comode, una borraccia d'acqua e un po' di pazienza.",
  "La biblioteca del paese apre il martedì e il giovedì pomeriggio, e presta anche giochi da tavolo.",
  "Quando il vento cambia direzione, i pescatori guardano il cielo e decidono se uscire con la barca.",
  "Il treno regionale si ferma in ogni stazione, ma dal finestrino si vedono campi, vigne e piccoli borghi.",
  "Per preparare una minestra di verdure servono carote, sedano, patate, un po' d'olio e tempo.",
  "Gli alberi del parco cambiano colore in autunno e le foglie coprono i sentieri di giallo e di rosso.",
  "Un orologio antico, se viene curato, può continuare a segnare l'ora giusta per più di un secolo.",
  "La sera d'estate le piazze si riempiono di persone che chiacchierano, mangiano un gelato e ascoltano musica.",
  "Il faro sulla scogliera guida le navi da molti anni, anche se oggi ci sono strumenti più moderni.",
  "Imparare a suonare uno strumento richiede esercizio quotidiano, orecchio e la voglia di sbagliare.",
  "Le api visitano migliaia di fiori ogni giorno e trasformano il nettare in miele dentro l'alveare.",
  "Il vecchio ponte di pietra ha resistito a molte piene, grazie agli archi costruiti con cura.",
  "Una mappa disegnata a mano racconta come qualcuno vedeva il territorio, non solo dove sono le strade.",
  "Nelle giornate di nebbia la pianura sembra senza confini e i rumori arrivano attutiti.",
  "Il cuoco assaggia il sugo più volte, aggiunge un pizzico di sale e lo lascia cuocere ancora.",
  "In montagna il tempo cambia in fretta, per questo chi cammina controlla le previsioni prima di partire.",
  "Il giardino dietro casa ospita pomodori, basilico, zucchine e qualche fiore per le farfalle.",
  "Una lettera scritta a mano arriva più lentamente di un messaggio, ma spesso viene conservata per anni.",
  "Il gatto del vicino passa le mattine al sole sul muretto e il pomeriggio dorme sotto il portico.",
  "Le stelle si vedono meglio lontano dalle città, dove le luci dei lampioni non coprono il cielo.",
  "Il laboratorio del falegname profuma di legno appena tagliato e di colla calda.",
  "Durante l'inverno le giornate sono corte e molte famiglie si ritrovano intorno a un tavolo a giocare a carte.",
];

// Testo generico di circa `parole` parole, deterministico dato il seme.
// Il prefisso unico (sessione) impedisce al server di riusare una cache del prompt.
export function testoLungo(sessione: string, seme: number, parole: number): string {
  let stato = seme >>> 0 || 1;
  const casuale = () => {
    stato = (Math.imul(stato, 1664525) + 1013904223) >>> 0;
    return stato / 2 ** 32;
  };
  const pezzi: string[] = [];
  let conteggio = 0;
  while (conteggio < parole) {
    const f = FRASI[Math.floor(casuale() * FRASI.length)];
    pezzi.push(f);
    conteggio += f.split(/\s+/).length;
  }
  return `Sessione ${sessione}. Leggi il testo seguente e poi riassumilo in una frase.\n\n${pezzi.join(" ")}`;
}
