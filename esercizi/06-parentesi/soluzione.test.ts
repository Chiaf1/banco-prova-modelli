import { test } from "node:test";
import assert from "node:assert/strict";

const { bilanciate } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("annidate", () => assert.equal(bilanciate("{[()()]}"), true));
test("incrociate", () => assert.equal(bilanciate("([)]"), false));
test("vuoto", () => assert.equal(bilanciate(""), true));
test("solo testo", () => assert.equal(bilanciate("ciao mondo"), true));
test("con altro testo", () => assert.equal(bilanciate("f(a[1], {b: 2})"), true));
test("aperta in più", () => assert.equal(bilanciate("(()"), false));
test("chiusa in più", () => assert.equal(bilanciate("())"), false));
test("chiusa per prima", () => assert.equal(bilanciate(")("), false));
test("tipo sbagliato", () => assert.equal(bilanciate("(]"), false));
test("lunga", () => assert.equal(bilanciate("(".repeat(10000) + ")".repeat(10000)), true));
