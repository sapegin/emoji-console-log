import {
  Position,
  type TextDocument,
  type TextEditorEdit,
  type TextLine,
} from 'vscode';
import type { CodeStyle } from './codeStyle';
import {
  BracketType,
  LogMessageType,
  type ExtensionProperties,
  type LogMessage,
} from '../types';
import { getRandomEmoji } from './emojis';
import { isAnonymousFunctionContext } from './isAnonymousFunctionContext';
import { anonymousPropertyDebuggingMessage } from './anonymousPropertyDebuggingMessage';
import { logDebugMessage } from './debug';
import { getMultiLineContextVariable } from './getMultiLineContextVariable';
import { isObjectLiteralAssignedToVariable } from './isObjectLiteralAssignedToVariable';
import { isArrayAssignedToVariable } from './isArrayAssignedToVariable';
import { isAssignedToVariable } from './isAssignedToVariable';
import { isAffectationToVariable } from './isAffectationToVariable';
import { closingContextLine } from './closingContextLine';
import { isObjectFunctionCall } from './isObjectFunctionCall';
import { doesContainsNamedFunctionDeclaration } from './doesContainsNamedFunctionDeclaration';
import { isFunctionAssignedToVariable } from './isFunctionAssignedToVariable';
import { isAnonymousFunction } from './isAnonymousFunction';
import { shouldTransformAnonymousFunction } from './shouldTransformAnonymousFunction';
import { debugMessageLine } from './debugMessageLine';
import { spacesBeforeLogMessage } from './spacesBeforeLogMessage';

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

function baseDebuggingMessage(
  document: TextDocument,
  textEditor: TextEditorEdit,
  lineOfLogMessage: number,
  debuggingMessage: string,
  insertEmptyLineBeforeLogMessage: boolean,
  insertEmptyLineAfterLogMessage: boolean,
): void {
  textEditor.insert(
    new Position(Math.min(lineOfLogMessage, document.lineCount), 0),
    `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
      lineOfLogMessage === document.lineCount ? '\n' : ''
    }${debuggingMessage}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
  );
}

function getLogMessage(
  document: TextDocument,
  selectionLine: number,
): LogMessage {
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
      if (isArrayAssignedToVariable(`${currentLineText}\n${currentLineText}`)) {
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

/**
 * Returns true when we're about to insert a log message on top of another
 * log message
 */
function shouldInsertEmptyLineAfterLogMessage(
  document: TextDocument,
  lineOfLogMessage: number,
  logFunction: ExtensionProperties['logFunction'],
) {
  const lineUnderInsertion = document.lineAt(lineOfLogMessage);
  const text = lineUnderInsertion.text.trimStart();
  return text !== '' && text.startsWith(logFunction) === false;
}

function isEmptyBlockContext(document: TextDocument, logMessage: LogMessage) {
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

function emptyBlockDebuggingMessage(
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
      new Position(Math.min(logMessageLine, document.lineCount), 0),
      `${textBeforeClosedFunctionParenthesis}) {\n${
        logMessageLine === document.lineCount ? '\n' : ''
      }${spacesBeforeMessage}${debuggingMessage}\n${spacesBeforeMessage}}\n`,
    );
  }
}

export function insertMessage(
  textEditor: TextEditorEdit,
  document: TextDocument,
  selectedVariable: string,
  lineOfSelectedVariable: number,
  style: CodeStyle,
  { logFunction }: ExtensionProperties,
): void {
  const logMessage = getLogMessage(document, lineOfSelectedVariable);
  const lineOfLogMessage = debugMessageLine(
    document,
    lineOfSelectedVariable,
    selectedVariable,
    logMessage,
  );
  const spacesBeforeMessage = spacesBeforeLogMessage(
    document,
    lineOfSelectedVariable,
    lineOfLogMessage,
  );

  const insertEmptyLineBeforeLogMessage =
    lineOfLogMessage - lineOfSelectedVariable > 1;
  const insertEmptyLineAfterLogMessage = shouldInsertEmptyLineAfterLogMessage(
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
  if (isEmptyBlockContext(document, logMessage)) {
    const emptyBlockLine =
      logMessage.type === LogMessageType.MultilineParenthesis
        ? document.lineAt(logMessage.metadata.closingContextLine)
        : (logMessage.type === LogMessageType.NamedFunction
          ? document.lineAt(logMessage.metadata.line)
          : undefined);
    if (emptyBlockLine) {
      emptyBlockDebuggingMessage(
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

  if (isAnonymousFunctionContext(selectedVariable, selectedVariableLineLoc)) {
    anonymousPropertyDebuggingMessage(
      document,
      textEditor,
      style,
      selectedVariableLine,
      debuggingMessageContent,
    );
    return;
  }

  baseDebuggingMessage(
    document,
    textEditor,
    lineOfLogMessage,
    debuggingMessage,
    insertEmptyLineBeforeLogMessage,
    insertEmptyLineAfterLogMessage,
  );
}
