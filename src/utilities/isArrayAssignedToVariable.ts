export function isArrayAssignedToVariable(loc: string): boolean {
  const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
  return /(const|let|var).*=\[.*/.test(locWithoutWhiteSpaces);
}
