import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import {
  BlockType,
  ExtensionProperties,
  BracketType,
  LogMessageType,
  Message,
} from '../types';
import { DebugMessageLine } from './DebugMessageLine';
import {
  getMultiLineContextVariable,
  closingContextLine,
  getRandomEmoji,
  emojis,
  CodeStyle,
} from '../utilities';
import { DebugMessageAnonymous } from './DebugMessageAnonymous';
import type { LogMessage } from '../types/LogMessage';
import { logDebugMessage } from '../utilities/debug';
import { isObjectLiteralAssignedToVariable } from '../utilities/isObjectLiteralAssignedToVariable';
import { isArrayAssignedToVariable } from '../utilities/isArrayAssignedToVariable';
import { isAssignedToVariable } from '../utilities/isAssignedToVariable';
import { isAffectationToVariable } from '../utilities/isAffectationToVariable';
import { isObjectFunctionCall } from '../utilities/isObjectFunctionCall';
import { doesContainsNamedFunctionDeclaration } from '../utilities/doesContainsNamedFunctionDeclaration';
import { isFunctionAssignedToVariable } from '../utilities/isFunctionAssignedToVariable';
import { isAnonymousFunction } from '../utilities/isAnonymousFunction';
import { shouldTransformAnonymousFunction } from '../utilities/shouldTransformAnonymousFunction';
import { doesContainClassDeclaration } from '../utilities/doesContainClassDeclaration';
import { getClassName } from '../utilities/getClassName';
import { doesContainsBuiltInFunction } from '../utilities/doesContainsBuiltInFunction';
import { getFunctionName } from '../utilities/getFunctionName';

const logMessageTypeVerificationPriority = [
  LogMessageType.Decorator,
  LogMessageType.Ternary,
  LogMessageType.ArrayAssignment,
  LogMessageType.ObjectLiteral,
  LogMessageType.ObjectFunctionCallAssignment,
  LogMessageType.NamedFunctionAssignment,
  LogMessageType.NamedFunction,
  LogMessageType.MultiLineAnonymousFunction,
  LogMessageType.MultilineParenthesis,
  LogMessageType.MultilineBraces,
  LogMessageType.PrimitiveAssignment,
];

export class DebugMessage {
  debugMessageLine: DebugMessageLine;
  debugMessageAnonymous: DebugMessageAnonymous;

  constructor(debugMessageLine: DebugMessageLine) {
    this.debugMessageLine = debugMessageLine;
    this.debugMessageAnonymous = new DebugMessageAnonymous();
  }

  private line(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
    logMessage: LogMessage,
  ): number {
    return this.debugMessageLine.line(
      document,
      selectionLine,
      selectedVariable,
      logMessage,
    );
  }

  private spacesBeforeLogMsg(
    document: TextDocument,
    selectedVariableLine: number,
    logMessageLine: number,
  ): string {
    const selectedVariableTextLine = document.lineAt(selectedVariableLine);
    const selectedVariableTextLineFirstNonWhitespaceCharacterIndex =
      selectedVariableTextLine.firstNonWhitespaceCharacterIndex;
    const spacesBeforeSelectedVariableLine = [...selectedVariableTextLine.text]
      .splice(0, selectedVariableTextLineFirstNonWhitespaceCharacterIndex)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        '',
      );
    if (logMessageLine < document.lineCount) {
      const logMessageTextLine = document.lineAt(logMessageLine);
      const logMessageTextLineFirstNonWhitespaceCharacterIndex =
        logMessageTextLine.firstNonWhitespaceCharacterIndex;
      const spacesBeforeLogMessageLine = [...logMessageTextLine.text]
        .splice(0, logMessageTextLineFirstNonWhitespaceCharacterIndex)
        .reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          '',
        );
      return spacesBeforeSelectedVariableLine.length >
        spacesBeforeLogMessageLine.length
        ? spacesBeforeSelectedVariableLine
        : spacesBeforeLogMessageLine;
    }
    return spacesBeforeSelectedVariableLine;
  }

  private baseDebuggingMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    lineOfLogMessage: number,
    debuggingMessage: string,
    insertEmptyLineBeforeLogMessage: boolean,
    insertEmptyLineAfterLogMessage: boolean,
  ): void {
    textEditor.insert(
      new Position(
        lineOfLogMessage >= document.lineCount
          ? document.lineCount
          : lineOfLogMessage,
        0,
      ),
      `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
        lineOfLogMessage === document.lineCount ? '\n' : ''
      }${debuggingMessage}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
    );
  }

  private isEmptyBlockContext(document: TextDocument, logMessage: LogMessage) {
    if (logMessage.type === LogMessageType.MultilineParenthesis) {
      return /\){.*}/.test(
        document
          .lineAt(logMessage.metadata.closingContextLine)
          .text.replaceAll(/\s/g, ''),
      );
    }
    if (logMessage.type === LogMessageType.NamedFunction) {
      return /\){.*}/.test(
        document.lineAt(logMessage.metadata.line).text.replaceAll(/\s/g, ''),
      );
    }
    return false;
  }

  /**
   * Returns true when we're about to insert a log message on top of another
   * log message
   */
  private shouldInsertEmptyLineAfterLogMessage(
    document: TextDocument,
    lineOfLogMessage: number,
    logFunction: ExtensionProperties['logFunction'],
  ) {
    const lineUnderInsertion = document.lineAt(lineOfLogMessage);
    const text = lineUnderInsertion.text.trimStart();
    return text !== '' && text.startsWith(logFunction) === false;
  }

  private emptyBlockDebuggingMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    emptyBlockLine: TextLine,
    logMessageLine: number,
    debuggingMessage: string,
    spacesBeforeMessage: string,
  ) {
    if (/\){.*}/.test(emptyBlockLine.text.replaceAll(/\s/g, ''))) {
      const textBeforeClosedFunctionParenthesis =
        emptyBlockLine.text.split(')')[0];
      textEditor.delete(emptyBlockLine.rangeIncludingLineBreak);
      textEditor.insert(
        new Position(
          logMessageLine >= document.lineCount
            ? document.lineCount
            : logMessageLine,
          0,
        ),
        `${textBeforeClosedFunctionParenthesis}) {\n${
          logMessageLine === document.lineCount ? '\n' : ''
        }${spacesBeforeMessage}${debuggingMessage}\n${spacesBeforeMessage}}\n`,
      );
    }
  }

  insertMessage(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVariable: string,
    lineOfSelectedVariable: number,
    style: CodeStyle,
    { logFunction }: ExtensionProperties,
  ): void {
    const logMessage = this.logMessage(document, lineOfSelectedVariable);
    const lineOfLogMessage = this.line(
      document,
      lineOfSelectedVariable,
      selectedVariable,
      logMessage,
    );
    const spacesBeforeMessage = this.spacesBeforeLogMsg(
      document,
      lineOfSelectedVariable,
      lineOfLogMessage,
    );

    const insertEmptyLineBeforeLogMessage =
      lineOfLogMessage - lineOfSelectedVariable > 1;
    const insertEmptyLineAfterLogMessage =
      this.shouldInsertEmptyLineAfterLogMessage(
        document,
        lineOfLogMessage,
        logFunction,
      );

    const { quote, semicolon } = style;
    const emoji = getRandomEmoji();
    const message = selectedVariable
      ? `${quote}${emoji} ${selectedVariable}${quote}`
      : `${quote}${emoji}${quote}`;
    const debuggingMessageContent = selectedVariable
      ? `${logFunction}(${message}, ${selectedVariable})${semicolon}`
      : `${logFunction}(${message})${semicolon}`;
    const debuggingMessage = `${spacesBeforeMessage}${debuggingMessageContent}`;
    const selectedVariableLine = document.lineAt(lineOfSelectedVariable);
    const selectedVariableLineLoc = selectedVariableLine.text;
    if (this.isEmptyBlockContext(document, logMessage)) {
      const emptyBlockLine =
        logMessage.type === LogMessageType.MultilineParenthesis
          ? document.lineAt(logMessage.metadata.closingContextLine)
          : (logMessage.type === LogMessageType.NamedFunction
            ? document.lineAt(logMessage.metadata.line)
            : undefined);
      if (emptyBlockLine) {
        this.emptyBlockDebuggingMsg(
          document,
          textEditor,
          emptyBlockLine,
          lineOfLogMessage,
          debuggingMessageContent,
          spacesBeforeMessage,
        );
      }
      return;
    }

    if (
      this.debugMessageAnonymous.isAnonymousFunctionContext(
        selectedVariable,
        selectedVariableLineLoc,
      )
    ) {
      this.debugMessageAnonymous.anonymousPropDebuggingMsg(
        document,
        textEditor,
        style,
        selectedVariableLine,
        debuggingMessageContent,
      );
      return;
    }

    this.baseDebuggingMsg(
      document,
      textEditor,
      lineOfLogMessage,
      debuggingMessage,
      insertEmptyLineBeforeLogMessage,
      insertEmptyLineAfterLogMessage,
    );
  }

  logMessage(document: TextDocument, selectionLine: number): LogMessage {
    const currentLineText: string = document.lineAt(selectionLine).text;
    const multilineParenthesisVariable = getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.PARENTHESIS,
    );
    const multilineBracesVariable = getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.CURLY_BRACES,
    );

    const logMessageTypesChecks: {
      [key in LogMessageType]: () => LogMessage | undefined;
    } = {
      [LogMessageType.ObjectLiteral]: () => {
        if (document.lineCount === selectionLine + 1) {
          return;
        }

        let nextLineIndex = selectionLine + 1;
        let nextLineText = document
          .lineAt(nextLineIndex)
          .text.replaceAll(/\s/g, '');

        // Skip comment-only lines
        while (
          nextLineText.trim().startsWith('//') ||
          nextLineText.trim().startsWith('/*')
        ) {
          if (nextLineText.trim().startsWith('/*')) {
            // Skip lines until the end of the multi-line comment
            while (!nextLineText.trim().endsWith('*/')) {
              nextLineIndex++;
              if (nextLineIndex >= document.lineCount) {
                return;
              }
              nextLineText = document
                .lineAt(nextLineIndex)
                .text.replaceAll(/\s/g, '');
            }
            nextLineIndex++;
          } else {
            nextLineIndex++;
          }

          if (nextLineIndex >= document.lineCount) {
            return;
          }

          nextLineText = document
            .lineAt(nextLineIndex)
            .text.replaceAll(/\s/g, '');
        }

        const combinedText = `${currentLineText}${nextLineText}`;
        if (isObjectLiteralAssignedToVariable(combinedText)) {
          return {
            type: LogMessageType.ObjectLiteral,
          };
        }
      },

      [LogMessageType.Decorator]: () => {
        if (/^@[\dA-Za-z]+(.*)[\dA-Za-z]+/.test(currentLineText.trim())) {
          return {
            type: LogMessageType.Decorator,
          };
        }
      },

      [LogMessageType.ArrayAssignment]: () => {
        if (
          isArrayAssignedToVariable(`${currentLineText}\n${currentLineText}`)
        ) {
          return {
            type: LogMessageType.ArrayAssignment,
          };
        }
      },

      [LogMessageType.Ternary]: () => {
        if (/`/.test(currentLineText)) {
          return {
            type: LogMessageType.Ternary,
          };
        }
      },

      [LogMessageType.MultilineBraces]: () => {
        const isChecked =
          multilineBracesVariable &&
          !isAssignedToVariable(currentLineText) &&
          !isAffectationToVariable(currentLineText);

        if (isChecked && multilineBracesVariable) {
          return {
            type: LogMessageType.MultilineBraces,
            metadata: {
              openingContextLine: multilineBracesVariable?.openingContextLine,
              closingContextLine: multilineBracesVariable?.closingContextLine,
            },
          };
        }
      },

      [LogMessageType.MultilineParenthesis]: () => {
        const isChecked = multilineParenthesisVariable !== null;
        if (isChecked) {
          const isOpeningCurlyBraceContext = document
            .lineAt(multilineParenthesisVariable?.closingContextLine ?? 0)
            .text.includes('{');
          const isOpeningParenthesisContext = document
            .lineAt(selectionLine)
            .text.includes('(');
          if (isOpeningCurlyBraceContext || isOpeningParenthesisContext) {
            if (isAssignedToVariable(currentLineText)) {
              return {
                type: LogMessageType.MultilineParenthesis,
                metadata: {
                  openingContextLine: selectionLine,
                  closingContextLine: closingContextLine(
                    document,
                    multilineParenthesisVariable?.closingContextLine ?? 0,
                    isOpeningCurlyBraceContext
                      ? BracketType.CURLY_BRACES
                      : BracketType.PARENTHESIS,
                  ),
                },
              };
            }
            return {
              type: LogMessageType.MultilineParenthesis,
              metadata: {
                openingContextLine:
                  multilineParenthesisVariable?.openingContextLine ?? 0,
                closingContextLine:
                  multilineParenthesisVariable?.closingContextLine ?? 0,
              },
            };
          }
        }
      },

      [LogMessageType.ObjectFunctionCallAssignment]: () => {
        if (document.lineCount === selectionLine + 1) {
          return;
        }
        const nextLineText: string = document
          .lineAt(selectionLine + 1)
          .text.replaceAll(/\s/g, '');
        if (
          isObjectFunctionCall(`${currentLineText}\n${nextLineText}`) &&
          isAssignedToVariable(currentLineText)
        ) {
          return {
            type: LogMessageType.ObjectFunctionCallAssignment,
          };
        }
      },

      [LogMessageType.NamedFunction]: () => {
        if (doesContainsNamedFunctionDeclaration(currentLineText)) {
          return {
            type: LogMessageType.NamedFunction,
            metadata: {
              line: selectionLine,
            },
          };
        }
      },

      [LogMessageType.NamedFunctionAssignment]: () => {
        if (
          isFunctionAssignedToVariable(`${currentLineText}`) &&
          multilineParenthesisVariable === null
        ) {
          return {
            type: LogMessageType.NamedFunctionAssignment,
          };
        }
      },

      [LogMessageType.MultiLineAnonymousFunction]: () => {
        if (
          isFunctionAssignedToVariable(`${currentLineText}`) &&
          isAnonymousFunction(currentLineText) &&
          shouldTransformAnonymousFunction(currentLineText)
        ) {
          return {
            type: LogMessageType.MultiLineAnonymousFunction,
          };
        }
      },

      // This is used as a default fallback
      [LogMessageType.PrimitiveAssignment]: () => {
        return {
          type: LogMessageType.PrimitiveAssignment,
        };
      },
    };

    for (const logMessageType of logMessageTypeVerificationPriority) {
      const result = logMessageTypesChecks[logMessageType]();
      if (result) {
        logDebugMessage('Log message type', logMessageType);
        return result;
      }
    }

    logDebugMessage('Log message type fallback');
    return {
      type: LogMessageType.PrimitiveAssignment,
    };
  }

  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVariable: number,
    blockType: BlockType,
  ): string {
    let currentLineNumber: number = lineOfSelectedVariable;
    while (currentLineNumber >= 0) {
      const currentLineText: string = document.lineAt(currentLineNumber).text;
      switch (blockType) {
        case 'class': {
          if (
            doesContainClassDeclaration(currentLineText) &&
            lineOfSelectedVariable > currentLineNumber &&
            lineOfSelectedVariable <
              closingContextLine(
                document,
                currentLineNumber,
                BracketType.CURLY_BRACES,
              )
          ) {
            return `${getClassName(currentLineText)}`;
          }
          break;
        }
        case 'function': {
          if (
            doesContainsNamedFunctionDeclaration(currentLineText) &&
            !doesContainsBuiltInFunction(currentLineText) &&
            lineOfSelectedVariable >= currentLineNumber &&
            lineOfSelectedVariable <
              closingContextLine(
                document,
                currentLineNumber,
                BracketType.CURLY_BRACES,
              )
          ) {
            return getFunctionName(currentLineText);
          }
          break;
        }
      }
      currentLineNumber--;
    }
    return '';
  }

  detectAll(document: TextDocument, logFunction: string): Message[] {
    const documentNbrOfLines: number = document.lineCount;
    const logMessages: Message[] = [];
    for (let index = 0; index < documentNbrOfLines; index++) {
      const emojiConsoleLogMessage = new RegExp(
        logFunction.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`),
      );
      if (emojiConsoleLogMessage.test(document.lineAt(index).text)) {
        const logMessage: Message = {
          spaces: '',
          lines: [],
        };
        logMessage.spaces = this.spacesBeforeLogMsg(document, index, index);
        const closedParenthesisLine = closingContextLine(
          document,
          index,
          BracketType.PARENTHESIS,
        );
        let message = '';
        for (
          let lineIndex = index;
          lineIndex <= closedParenthesisLine;
          lineIndex++
        ) {
          message += document.lineAt(lineIndex).text;
          logMessage.lines.push(
            document.lineAt(lineIndex).rangeIncludingLineBreak,
          );
        }
        if (new RegExp(emojis.join('|')).test(message)) {
          logMessages.push(logMessage);
        }
      }
    }
    return logMessages;
  }
}
