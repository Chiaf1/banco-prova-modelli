export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new RangeError("Input must be an integer between 1 and 3999");
  }

  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];

  let result = "";
  let remaining = n;

  for (let i = 0; i < values.length; i++) {
    const count = Math.floor(remaining / values[i]);
    if (count > 0) {
      result += symbols[i].repeat(count);
      remaining -= values[i] * count;
    }
  }

  return result;
}

export function daRomano(s: string): number {
  if (typeof s !== "string" || s.length === 0) {
    throw new RangeError("Input must be a non-empty string");
  }

  // Check for invalid characters
  if (!/^[IVXLCDM]+$/.test(s)) {
    throw new RangeError("Input contains invalid characters");
  }

  // Check for invalid patterns (like IIII, VV, etc.)
  // Valid repetitions: I, X, C, M can repeat up to 3 times; V, L, D never repeat
  if (/V{2,}|L{2,}|D{2,}/.test(s)) {
    throw new RangeError("Invalid repetition of V, L, or D");
  }

  // Check for invalid subtractive combinations
  // I can only precede V and X
  // X can only precede L and C
  // C can only precede D and M
  if (/I[VX]/.test(s) === false && /I[VX]/.test(s)) {
    // This is always true if the regex matches, so we need a different approach
  }
  
  // Better approach: validate the string structure by trying to parse it and checking against expected patterns
  // We'll parse it and then verify that converting back gives the same string
  
  // Map of Roman numerals to values
  const romanMap: Record<string, number> = {
    "I": 1,
    "V": 5,
    "X": 10,
    "L": 50,
    "C": 100,
    "D": 500,
    "M": 1000
  };

  // Parse the Roman numeral
  let total = 0;
  let i = 0;
  
  while (i < s.length) {
    const current = romanMap[s[i]];
    const next = i + 1 < s.length ? romanMap[s[i + 1]] : 0;
    
    if (current < next) {
      total += next - current;
      i += 2;
    } else {
      total += current;
      i++;
    }
  }

  // Validate that the parsed number converts back to the same string
  const convertedBack = aRomano(total);
  if (convertedBack !== s) {
    throw new RangeError("Invalid Roman numeral format");
  }

  return total;
}
