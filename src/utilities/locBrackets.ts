import { BracketType, LogBracket } from '../types';

export function locBrackets(loc: string, bracketType: BracketType): LogBracket {
  let openingBrackets = 0;
  let closingBrackets = 0;
  const openedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\(/g : /{/g;
  const closedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\)/g : /}/g;
  while (openedElement.test(loc)) {
    openingBrackets++;
  }
  while (closedElement.test(loc)) {
    closingBrackets++;
  }
  return {
    openingBrackets,
    closingBrackets,
  };
}
