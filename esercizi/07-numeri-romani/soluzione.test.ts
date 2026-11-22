import { test } from "node:test";
import assert from "node:assert/strict";

const { aRomano, daRomano } = await import(process.env.SOLUZIONE || "./riferimento.ts");

test("aRomano: casi noti", () => {
  assert.equal(aRomano(1), "I");
  assert.equal(aRomano(4), "IV");
  assert.equal(aRomano(9), "IX");
  assert.equal(aRomano(14), "XIV");
  assert.equal(aRomano(40), "XL");
  assert.equal(aRomano(90), "XC");
  assert.equal(aRomano(400), "CD");
  assert.equal(aRomano(1994), "MCMXCIV");
  assert.equal(aRomano(2024), "MMXXIV");
  assert.equal(aRomano(3999), "MMMCMXCIX");
});
test("aRomano: fuori intervallo", () => {
  for (const n of [0, -1, 4000, 2.5, NaN]) assert.throws(() => aRomano(n), RangeError, String(n));
});
test("daRomano: casi noti", () => {
  assert.equal(daRomano("III"), 3);
  assert.equal(daRomano("XLII"), 42);
  assert.equal(daRomano("MCMXCIV"), 1994);
  assert.equal(daRomano("MMMCMXCIX"), 3999);
});
test("daRomano: andata e ritorno da 1 a 3999", () => {
  for (let n = 1; n <= 3999; n++) assert.equal(daRomano(aRomano(n)), n);
});
test("daRomano: forme non standard", () => {
  for (const s of ["IIII", "IC", "VX", "MMMM", "iv", "", "IIV", "XM", "VV", "LL", "DD", "IXI", "ABC"]) {
    assert.throws(() => daRomano(s), RangeError, s);
  }
});
