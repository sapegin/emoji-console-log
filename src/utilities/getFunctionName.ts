import { doesContainsNamedFunctionDeclaration } from './doesContainsNamedFunctionDeclaration';

export function getFunctionName(loc: string): string {
  if (doesContainsNamedFunctionDeclaration(loc)) {
    if (/(const|let|var)(\s*)[\dA-Za-z]*\s*=/.test(loc)) {
      return loc
        .split('=')[0]
        .replaceAll(/export |module.exports |const |var |let |=|(\s*)/g, '');
    } else if (/function(\s+)/.test(loc)) {
      return loc.split('function ')[1].split('(')[0].replaceAll(/(\s*)/g, '');
    } else {
      return loc
        .split(/\(.*\)/)[0]
        .replaceAll(
          /async |static |public |private |protected |export |default |(\s*)/g,
          '',
        );
    }
  } else {
    return '';
  }
}
