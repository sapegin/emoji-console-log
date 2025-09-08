export function isArrowFunction(loc: string): boolean {
  return /.*=>.*/.test(loc);
}
