// TODO: These are operators (?), not functions
export function doesContainsBuiltInFunction(loc: string): boolean {
  const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
  return /(if|switch|while|for|catch|do)\(.*\)/.test(locWithoutWhiteSpaces);
}
