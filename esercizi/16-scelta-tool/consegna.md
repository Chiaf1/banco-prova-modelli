# Scelta del tool

Sei l'assistente di un reparto di stampaggio (reparto, macchine e persone inventati). Puoi chiamare i tool descritti qui sotto con i loro schemi JSON. Tutti gli orari sono in ora locale.

```json
[
  {
    "name": "apri_ticket",
    "description": "Apre un ticket di manutenzione per una macchina.",
    "parameters": {
      "type": "object",
      "properties": {
        "macchina": { "type": "string", "pattern": "^[A-Z]-[0-9]{2}$" },
        "priorita": { "type": "string", "enum": ["bassa", "media", "alta"] },
        "descrizione": { "type": "string" }
      },
      "required": ["macchina", "priorita", "descrizione"],
      "additionalProperties": false
    }
  },
  {
    "name": "prenota_intervento",
    "description": "Prenota un tecnico della manutenzione per un turno.",
    "parameters": {
      "type": "object",
      "properties": {
        "macchina": { "type": "string", "pattern": "^[A-Z]-[0-9]{2}$" },
        "data": { "type": "string", "description": "AAAA-MM-GG" },
        "turno": { "type": "string", "enum": ["mattino", "pomeriggio", "notte"] },
        "motivo": { "type": "string" }
      },
      "required": ["macchina", "data", "turno", "motivo"],
      "additionalProperties": false
    }
  },
  {
    "name": "invia_email",
    "description": "Invia un'email a uno o più indirizzi.",
    "parameters": {
      "type": "object",
      "properties": {
        "destinatari": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "oggetto": { "type": "string" },
        "testo": { "type": "string" }
      },
      "required": ["destinatari", "oggetto", "testo"],
      "additionalProperties": false
    }
  },
  {
    "name": "leggi_sensore",
    "description": "Valori di un sensore negli ultimi minuti, al massimo 120. Per periodi più lunghi usa storico_sensore.",
    "parameters": {
      "type": "object",
      "properties": {
        "macchina": { "type": "string", "pattern": "^[A-Z]-[0-9]{2}$" },
        "sensore": { "type": "string", "enum": ["temperatura_olio", "temperatura_motore", "pressione", "vibrazioni"] },
        "ultimi_minuti": { "type": "integer", "minimum": 1, "maximum": 120 }
      },
      "required": ["macchina", "sensore", "ultimi_minuti"],
      "additionalProperties": false
    }
  },
  {
    "name": "storico_sensore",
    "description": "Valori di un sensore tra due istanti, estremi compresi.",
    "parameters": {
      "type": "object",
      "properties": {
        "macchina": { "type": "string", "pattern": "^[A-Z]-[0-9]{2}$" },
        "sensore": { "type": "string", "enum": ["temperatura_olio", "temperatura_motore", "pressione", "vibrazioni"] },
        "da": { "type": "string", "description": "AAAA-MM-GGThh:mm" },
        "a": { "type": "string", "description": "AAAA-MM-GGThh:mm" }
      },
      "required": ["macchina", "sensore", "da", "a"],
      "additionalProperties": false
    }
  }
]
```

Sono le 10:40 di lunedì 16 novembre 2026. Il capoturno scrive:

> La pressa P-07 stamattina ha dato due volte l'allarme di sovratemperatura dell'olio. Prima di aprire un ticket o di chiamare la manutenzione voglio vedere com'è andata la temperatura dell'olio nelle ultime due ore e mezza, fino a adesso. La pressione l'ho già guardata io, è a posto.

Decidi la **prima** chiamata da fare, una sola, e scrivila come oggetto JSON con esattamente due campi: `tool` (il nome del tool) e `argomenti` (l'oggetto degli argomenti, valido per lo schema del tool).
