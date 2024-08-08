export function doesContainsNamedFunctionDeclaration(loc: string): boolean {
  const locWithoutFunctionKeyword = loc.replace('function', '');
  const regularNamedFunctionRegex = new RegExp(/\s*[\dA-Za-z]+\s*\(.*\):?.*{/);
  const regularFunctionAssignedToVariableRegex = new RegExp(
    /(const|let|var)(\s*)[\dA-Za-z]*\s*=(\s*)\(.*\)(\s*){/,
  );
  const arrowFunctionAssignedToVariableRegex = new RegExp(
    /(const|let|var)(\s*)[\dA-Za-z]*\s*=.*=>.*/,
  );
  return (
    regularNamedFunctionRegex.test(locWithoutFunctionKeyword) ||
    regularFunctionAssignedToVariableRegex.test(locWithoutFunctionKeyword) ||
    arrowFunctionAssignedToVariableRegex.test(loc)
  );
}
