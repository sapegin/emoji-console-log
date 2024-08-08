export function isAffectationToVariable(loc: string): boolean {
  return /.*=.*/.test(loc);
}
