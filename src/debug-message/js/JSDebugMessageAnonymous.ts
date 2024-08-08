import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import { BracketType } from '../../types';
import { LineCodeProcessing } from '../../line-code-processing';
import {
  spacesBeforeLine,
  closingContextLine,
  CodeStyle,
} from '../../utilities';

export class JSDebugMessageAnonymous {
  lineCodeProcessing: LineCodeProcessing;
  constructor(lineCodeProcessing: LineCodeProcessing) {
    this.lineCodeProcessing = lineCodeProcessing;
  }
  isAnonymousFunctionContext(
    selectedVariable: string,
    selectedVariableLineLoc: string,
  ): boolean {
    return (
      this.lineCodeProcessing.isAnonymousFunction(selectedVariableLineLoc) &&
      this.lineCodeProcessing.isArgumentOfAnonymousFunction(
        selectedVariableLineLoc,
        selectedVariable,
      ) &&
      this.lineCodeProcessing.shouldTransformAnonymousFunction(
        selectedVariableLineLoc,
      )
    );
  }

  anonymousPropDebuggingMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    style: CodeStyle,
    selectedPropertyLine: TextLine,
    debuggingMessage: string,
  ): void {
    const selectedVariablePropertyLoc = selectedPropertyLine.text;
    const anonymousFunctionLeftPart = selectedVariablePropertyLoc
      .split('=>')[0]
      .trim();
    const anonymousFunctionRightPart = selectedVariablePropertyLoc
      .split('=>')[1]
      .replace(style.semicolon, '')
      .trim()
      .replace(/\)\s*;?$/, '');
    const spacesBeforeSelectedVariableLine = spacesBeforeLine(
      document,
      selectedPropertyLine.lineNumber,
    );
    const spacesBeforeLinesToInsert = `${spacesBeforeSelectedVariableLine}${style.tab}`;
    const isCalledInsideFunction = /\)\s*;?$/.test(selectedVariablePropertyLoc);
    const isNextLineCallToOtherFunction = document
      .lineAt(selectedPropertyLine.lineNumber + 1)
      .text.trim()
      .startsWith('.');
    const anonymousFunctionClosedParenthesisLine = closingContextLine(
      document,
      selectedPropertyLine.lineNumber,
      BracketType.PARENTHESIS,
    );
    const isReturnBlockMultiLine =
      anonymousFunctionClosedParenthesisLine -
        selectedPropertyLine.lineNumber !==
      0;

    textEditor.delete(selectedPropertyLine.range);
    textEditor.insert(
      new Position(selectedPropertyLine.lineNumber, 0),
      `${spacesBeforeSelectedVariableLine}${anonymousFunctionLeftPart} => {\n`,
    );
    if (isReturnBlockMultiLine) {
      textEditor.insert(
        new Position(selectedPropertyLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMessage}\n`,
      );
      let currentLine = document.lineAt(selectedPropertyLine.lineNumber + 1);
      do {
        textEditor.delete(currentLine.range);
        const addReturnKeyword =
          currentLine.lineNumber === selectedPropertyLine.lineNumber + 1;
        const spacesBeforeCurrentLine = spacesBeforeLine(
          document,
          currentLine.lineNumber,
        );
        if (currentLine.text.trim() === ')') {
          currentLine = document.lineAt(currentLine.lineNumber + 1);
          continue;
        }
        if (currentLine.lineNumber === anonymousFunctionClosedParenthesisLine) {
          textEditor.insert(
            new Position(currentLine.lineNumber, 0),
            `${spacesBeforeCurrentLine}${
              addReturnKeyword ? 'return ' : style.tab
            }${currentLine.text.trim().replace(/\)\s*$/, '')}\n`,
          );
        } else {
          textEditor.insert(
            new Position(currentLine.lineNumber, 0),
            `${spacesBeforeCurrentLine}${
              addReturnKeyword ? 'return ' : style.tab
            }${currentLine.text.trim()}\n`,
          );
        }
        currentLine = document.lineAt(currentLine.lineNumber + 1);
      } while (
        currentLine.lineNumber <
        anonymousFunctionClosedParenthesisLine + 1
      );
      textEditor.insert(
        new Position(anonymousFunctionClosedParenthesisLine + 1, 0),
        `${spacesBeforeSelectedVariableLine}}${
          style.semicolon && !isReturnBlockMultiLine ? style.semicolon : ''
        })\n`,
      );
    } else {
      const nextLineText = document.lineAt(
        selectedPropertyLine.lineNumber + 1,
      ).text;
      const nextLineIsEndWithinTheMainFunction = /^\)/.test(
        nextLineText.trim(),
      );
      textEditor.insert(
        new Position(selectedPropertyLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMessage}\n\n`,
      );
      textEditor.insert(
        new Position(selectedPropertyLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}return ${anonymousFunctionRightPart}${style.semicolon}\n`,
      );
      textEditor.insert(
        new Position(selectedPropertyLine.lineNumber, 0),
        `${spacesBeforeSelectedVariableLine}}${isCalledInsideFunction ? ')' : ''}${
          style.semicolon &&
          !isNextLineCallToOtherFunction &&
          !nextLineIsEndWithinTheMainFunction
            ? style.semicolon
            : ''
        }${nextLineText === '' ? '' : '\n'}`,
      );
    }
  }
}
