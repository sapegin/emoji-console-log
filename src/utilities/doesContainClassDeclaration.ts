export function doesContainClassDeclaration(loc: string): boolean {
  return /class(\s+).*{/.test(loc);
}
