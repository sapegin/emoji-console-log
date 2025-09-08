/**
 * Returns true when a given line contains an arrow function.
 */
export function isArrowFunction(loc: string): boolean {
  return /.*=>.*/.test(loc);
}
