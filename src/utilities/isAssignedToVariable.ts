export function isAssignedToVariable(loc: string): boolean {
  return /(const|let|var).*{?\s*}?=.*/.test(loc);
}
