export function isAnonymousFunction(loc: string): boolean {
  return /.*=>.*/.test(loc);
}
