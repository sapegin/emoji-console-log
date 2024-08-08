export function isObjectLiteralAssignedToVariable(loc: string): boolean {
  const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
  return /(const|let|var)\w+(:?.*)={(\w+(\(\)|:?.*))/g.test(
    locWithoutWhiteSpaces,
  );
}
