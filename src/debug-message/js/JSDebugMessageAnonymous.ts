import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import { BracketType } from '../../entities';
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
    selectedVar: string,
    selectedVarLineLoc: string,
  ): boolean {
    return (
      this.lineCodeProcessing.isAnonymousFunction(selectedVarLineLoc) &&
      this.lineCodeProcessing.isArgumentOfAnonymousFunction(
        selectedVarLineLoc,
        selectedVar,
      ) &&
      this.lineCodeProcessing.shouldTransformAnonymousFunction(
        selectedVarLineLoc,
      )
    );
  }

  anonymousPropDebuggingMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    style: CodeStyle,
    selectedPropLine: TextLine,
    debuggingMsg: string,
  ): void {
    const selectedVarPropLoc = selectedPropLine.text;
    const anonymousFunctionLeftPart = selectedVarPropLoc.split('=>')[0].trim();
    const anonymousFunctionRightPart = selectedVarPropLoc
      .split('=>')[1]
      .replace(style.semicolon, '')
      .trim()
      .replace(/\)\s*;?$/, '');
    const spacesBeforeSelectedVarLine = spacesBeforeLine(
      document,
      selectedPropLine.lineNumber,
    );
    const spacesBeforeLinesToInsert = `${spacesBeforeSelectedVarLine}${style.tab}`;
    const isCalledInsideFunction = /\)\s*;?$/.test(selectedVarPropLoc);
    const isNextLineCallToOtherFunction = document
      .lineAt(selectedPropLine.lineNumber + 1)
      .text.trim()
      .startsWith('.');
    const anonymousFunctionClosedParenthesisLine = closingContextLine(
      document,
      selectedPropLine.lineNumber,
      BracketType.PARENTHESIS,
    );
    const isReturnBlockMultiLine =
      anonymousFunctionClosedParenthesisLine - selectedPropLine.lineNumber !==
      0;

    textEditor.delete(selectedPropLine.range);
    textEditor.insert(
      new Position(selectedPropLine.lineNumber, 0),
      `${spacesBeforeSelectedVarLine}${anonymousFunctionLeftPart} => {\n`,
    );
    if (isReturnBlockMultiLine) {
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMsg}\n`,
      );
      let currentLine = document.lineAt(selectedPropLine.lineNumber + 1);
      do {
        textEditor.delete(currentLine.range);
        const addReturnKeyword =
          currentLine.lineNumber === selectedPropLine.lineNumber + 1;
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
        `${spacesBeforeSelectedVarLine}}${
          style.semicolon && !isReturnBlockMultiLine ? style.semicolon : ''
        })\n`,
      );
    } else {
      const nextLineText = document.lineAt(
        selectedPropLine.lineNumber + 1,
      ).text;
      const nextLineIsEndWithinTheMainFunction = /^\)/.test(
        nextLineText.trim(),
      );
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMsg}\n\n`,
      );
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}return ${anonymousFunctionRightPart}${style.semicolon}\n`,
      );
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeSelectedVarLine}}${isCalledInsideFunction ? ')' : ''}${
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
