import { TextDocument } from 'vscode';
import { BracketType, MultilineContextVariable } from '../types';
import { locBrackets } from './locBrackets';
import { closingContextLine } from './closingContextLine';

export function getMultiLineContextVariable(
  document: TextDocument,
  lineNumber: number,
  bracketType: BracketType,
  innerScope = true,
): MultilineContextVariable | undefined {
  const { openingBrackets, closingBrackets } = locBrackets(
    document.lineAt(lineNumber).text,
    bracketType,
  );
  if (
    innerScope &&
    openingBrackets !== 0 &&
    openingBrackets === closingBrackets
  ) {
    return undefined;
  }
  let currentLineNumber = lineNumber - 1;
  let nbrOfOpenedBlockType = 0;
  let nbrOfClosedBlockType = 1; // Closing parenthesis
  while (currentLineNumber >= 0) {
    const currentLineText: string = document.lineAt(currentLineNumber).text;
    const currentLineParenthesis = locBrackets(currentLineText, bracketType);
    nbrOfOpenedBlockType += currentLineParenthesis.openingBrackets;
    nbrOfClosedBlockType += currentLineParenthesis.closingBrackets;
    if (nbrOfOpenedBlockType === nbrOfClosedBlockType) {
      return {
        openingContextLine: currentLineNumber,
        closingContextLine: closingContextLine(
          document,
          currentLineNumber,
          bracketType,
        ),
      };
    }
    currentLineNumber--;
  }
  if (bracketType === BracketType.PARENTHESIS && openingBrackets > 0) {
    return {
      openingContextLine: lineNumber,
      closingContextLine: closingContextLine(document, lineNumber, bracketType),
    };
  }
  return undefined;
}
