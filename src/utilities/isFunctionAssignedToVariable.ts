export function isFunctionAssignedToVariable(loc: string): boolean {
  return /(const|let|var)?.*\s*=.*\(.*/.test(loc);
}
