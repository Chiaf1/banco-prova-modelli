import { test } from "node:test";
import assert from "node:assert/strict";

const { leggiCsv } = await import(process.env.SOLUZIONE || "./riferimento.ts");

function errore(testo: string, messaggio: string, separatore?: string) {
  assert.throws(
    () => (separatore === undefined ? leggiCsv(testo) : leggiCsv(testo, separatore)),
    (e: unknown) => e instanceof SyntaxError && e.message === messaggio,
    `${JSON.stringify(testo)} → ${messaggio}`,
  );
}

test("esempio della consegna", () =>
  assert.deepEqual(leggiCsv('nome,nota\nAnna,"dice ""ciao"", poi va"\n'), [
    ["nome", "nota"],
    ["Anna", 'dice "ciao", poi va'],
  ]));
test("a capo finale facoltativo, LF e CRLF", () => {
  const atteso = [["a", "b"], ["1", "2"]];
  assert.deepEqual(leggiCsv("a,b\n1,2"), atteso);
  assert.deepEqual(leggiCsv("a,b\n1,2\n"), atteso);
  assert.deepEqual(leggiCsv("a,b\r\n1,2\r\n"), atteso);
  assert.deepEqual(leggiCsv("a,b\r\n1,2\n"), atteso);
});
test("testo vuoto e righe vuote", () => {
  assert.deepEqual(leggiCsv(""), []);
  assert.deepEqual(leggiCsv("\n\r\n\n"), []);
  assert.deepEqual(leggiCsv("a\n\nb\r\n\r\n\nc"), [["a"], ["b"], ["c"]]);
  assert.deepEqual(leggiCsv("\n\na,b\n"), [["a", "b"]]);
});
test("campi vuoti", () => {
  assert.deepEqual(leggiCsv(",\n,"), [["", ""], ["", ""]]);
  assert.deepEqual(leggiCsv("a,\n,b\n"), [["a", ""], ["", "b"]]);
  assert.deepEqual(leggiCsv('""\nx'), [[""], ["x"]]);
  assert.deepEqual(leggiCsv('a,""'), [["a", ""]]);
});
test("spazi conservati", () => assert.deepEqual(leggiCsv(" a , b \n"), [[" a ", " b "]]));
test("virgolette", () => {
  assert.deepEqual(leggiCsv('"a,b","c""d"'), [["a,b", 'c"d']]);
  assert.deepEqual(leggiCsv('""""'), [['"']]);
  assert.deepEqual(leggiCsv('"""a"""'), [['"a"']]);
});
test("a capo dentro le virgolette", () => {
  assert.deepEqual(leggiCsv('"uno\ndue",x\r\n"a\r\nb",y\n"c\rd",z'), [
    ["uno\ndue", "x"],
    ["a\r\nb", "y"],
    ["c\rd", "z"],
  ]);
  assert.deepEqual(leggiCsv('"\n\n"'), [["\n\n"]]);
});
test("altri separatori", () => {
  assert.deepEqual(leggiCsv('a;"b;c";d,e\n', ";"), [["a", "b;c", "d,e"]]);
  assert.deepEqual(leggiCsv("a\tb\n\t\n", "\t"), [["a", "b"], ["", ""]]);
  assert.deepEqual(leggiCsv("a,b", "|"), [["a,b"]]);
});
test("separatore non valido", () => {
  for (const s of ["", ";;", '"', "\n", "\r"]) assert.throws(() => leggiCsv("a", s), RangeError, JSON.stringify(s));
});
test("errore: virgolette in un campo senza virgolette", () => {
  errore('a,b"c\n', "riga 1, colonna 4: virgolette in un campo senza virgolette");
  errore('x\n a"', "riga 2, colonna 3: virgolette in un campo senza virgolette");
  errore(' "a"', "riga 1, colonna 2: virgolette in un campo senza virgolette");
});
test("errore: carattere dopo le virgolette di chiusura", () => {
  errore('a,"b"c', "riga 1, colonna 6: carattere dopo le virgolette di chiusura");
  errore('a,"b" ,c', "riga 1, colonna 6: carattere dopo le virgolette di chiusura");
  errore('"x\ny"z', "riga 2, colonna 3: carattere dopo le virgolette di chiusura");
  errore('a;"b",c', "riga 1, colonna 6: carattere dopo le virgolette di chiusura", ";");
});
test("errore: virgolette non chiuse", () => {
  errore('"', "riga 1, colonna 1: virgolette non chiuse");
  errore('x,y\n"abc', "riga 2, colonna 1: virgolette non chiuse");
  errore('x,y\n1,"a\nb\nc', "riga 2, colonna 3: virgolette non chiuse");
  errore('a,"b""', "riga 1, colonna 3: virgolette non chiuse");
});
test("errore: a capo non valido", () => {
  errore("a\rb", "riga 1, colonna 2: a capo non valido");
  errore('"a"\rb', "riga 1, colonna 4: a capo non valido");
  errore("a,b\r", "riga 1, colonna 4: a capo non valido");
  errore("x\n\r", "riga 2, colonna 1: a capo non valido");
});
test("errore: numero di campi", () => {
  errore("a,b\n1,2,3\n", "riga 2, colonna 1: attesi 2 campi, trovati 3");
  errore('"a\nb",c\nd\n', "riga 3, colonna 1: attesi 2 campi, trovati 1");
  errore("a,b\n\n\nc\n", "riga 4, colonna 1: attesi 2 campi, trovati 1");
  errore('a,b\n1,"x\ny"\n2', "riga 4, colonna 1: attesi 2 campi, trovati 1");
  errore("a\n,", "riga 2, colonna 1: attesi 1 campi, trovati 2");
});
test("si segnala il primo errore", () => {
  errore('a,b\n1,"2"x,3', "riga 2, colonna 6: carattere dopo le virgolette di chiusura");
  errore('a,b\n1,2,3\n"', "riga 2, colonna 1: attesi 2 campi, trovati 3");
  errore('a,b"\n"', "riga 1, colonna 4: virgolette in un campo senza virgolette");
});
test("testo lungo", () => {
  const riga = 'abc,"d,e","f""g",h\n';
  const r = leggiCsv(riga.repeat(50_000));
  assert.equal(r.length, 50_000);
  assert.deepEqual(r[49_999], ["abc", "d,e", 'f"g', "h"]);
});
