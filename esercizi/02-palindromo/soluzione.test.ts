import { test } from "node:test";
import assert from "node:assert/strict";

const { palindromo } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("parola palindroma", () => assert.equal(palindromo("anna"), true));
test("parola non palindroma", () => assert.equal(palindromo("anno"), false));
test("frase con spazi e maiuscole", () => assert.equal(palindromo("I topi non avevano nipoti"), true));
test("punteggiatura ignorata", () => assert.equal(palindromo("Eva, can I see bees in a cave?"), true));
test("cifre", () => assert.equal(palindromo("12a21"), true));
test("cifre non palindrome", () => assert.equal(palindromo("123"), false));
test("stringa vuota", () => assert.equal(palindromo(""), true));
test("solo simboli", () => assert.equal(palindromo("?! ,"), true));
