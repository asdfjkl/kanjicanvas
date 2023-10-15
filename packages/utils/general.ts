export const numberToHex = (number: number): string => number.toString(16);

export const hexToInteger = (hex: string): number => parseInt(hex, 16);

export const hexToDecimal = (hex: string): number =>
  Array.from(hex).reduce((acc, hexDigit, idx) => acc + hexToInteger(hexDigit) / Math.pow(16, idx + 1), 0);

export const hexToNumber = (hexString: string): number => {
  const [integerPart, decimalPart] = hexString.split(".");
  return hexToInteger(integerPart) + (decimalPart ? hexToDecimal(decimalPart) : 0);
};
