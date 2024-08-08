export function isObjectFunctionCall(loc: string): boolean {
  const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
  return /([\dA-Za-z]+\.[\dA-Za-z]+)\(+/.test(locWithoutWhiteSpaces);
}
