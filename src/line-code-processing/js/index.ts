import { LineCodeProcessing } from '..';

export class JSLineCodeProcessing implements LineCodeProcessing {
  isAnonymousFunction(loc: string): boolean {
    return /.*=>.*/.test(loc);
  }
  isArgumentOfAnonymousFunction(loc: string, argument: string): boolean {
    if (this.isAnonymousFunction(loc)) {
      const match = loc.match(/(\(.*\)|\w+)\s*=>/);
      return match !== null && match[1].includes(argument);
    }
    return false;
  }
  shouldTransformAnonymousFunction(loc: string): boolean {
    if (this.isAnonymousFunction(loc)) {
      if (/.*=>\s+{/.test(loc)) {
        return false;
      }
      return true;
    }
    return false;
  }
  isAssignedToVariable(loc: string): boolean {
    return /(const|let|var).*{?\s*}?=.*/.test(loc);
  }
  isAffectationToVariable(loc: string): boolean {
    return /.*=.*/.test(loc);
  }
  isObjectLiteralAssignedToVariable(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
    return /(const|let|var)\w+(:?.*)={(\w+(\(\)|:?.*))/g.test(
      locWithoutWhiteSpaces,
    );
  }

  isArrayAssignedToVariable(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
    return /(const|let|var).*=\[.*/.test(locWithoutWhiteSpaces);
  }
  doesContainClassDeclaration(loc: string): boolean {
    return /class(\s+).*{/.test(loc);
  }
  getClassName(loc: string): string {
    if (this.doesContainClassDeclaration(loc)) {
      return loc.split('class ')[1].trim().split(' ')[0].replace('{', '');
    } else {
      return '';
    }
  }
  doesContainsBuiltInFunction(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
    return /(if|switch|while|for|catch|do)\(.*\)/.test(locWithoutWhiteSpaces);
  }
  doesContainsNamedFunctionDeclaration(loc: string): boolean {
    const locWithoutFunctionKeyword = loc.replace('function', '');
    const regularNamedFunctionRegex = new RegExp(
      /\s*[\dA-Za-z]+\s*\(.*\):?.*{/,
    );
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
  isFunctionAssignedToVariable(loc: string): boolean {
    return /(const|let|var)?.*\s*=.*\(.*/.test(loc);
  }
  isFunctionDeclaration(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
    const isDecorator = /@/.test(loc.split('(')[0]);
    return (
      (/.*\(.*/.test(locWithoutWhiteSpaces) ||
        /=>/.test(locWithoutWhiteSpaces)) &&
      !isDecorator
    );
  }
  isObjectFunctionCall(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replaceAll(/\s/g, '');
    return /([\dA-Za-z]+\.[\dA-Za-z]+)\(+/.test(locWithoutWhiteSpaces);
  }
  getFunctionName(loc: string): string {
    if (this.doesContainsNamedFunctionDeclaration(loc)) {
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
}
