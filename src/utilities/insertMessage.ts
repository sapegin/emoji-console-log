import {
  Position,
  Selection,
  type TextDocument,
  type TextEditor,
  type TextLine,
} from 'vscode';
import type { CodeStyle } from './codeStyle';
import {
  BracketType,
  LogMessageType,
  type ExtensionProperties,
  type LogMessageInfo,
} from '../types';
import { getRandomEmoji } from './emojis';
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
import { isArrowFunction } from './isArrowFunction';
import { shouldTransformArrowFunction } from './shouldTransformArrowFunction';
import { debugMessageLine } from './debugMessageLine';
import { spacesBeforeLogMessage } from './spacesBeforeLogMessage';
import { isArgumentOfArrowFunction } from './isArgumentOfArrowFunction';

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

/**
 * Add an empty console.log() to an empty line and adjusts the cursor position
 * to be inside the console.log() call.
 */
async function emptyLineDebuggingMessage(
  editor: TextEditor,
  lineOfSelectedVariable: number,
  debuggingMessage: string,
  logFunction: string,
): Promise<void> {
  // Insert the log at the cursor line
  await editor.edit((textEdit) => {
    textEdit.insert(
      new Position(lineOfSelectedVariable, 0),
      `${debuggingMessage}\n`,
    );
  });

  // Place the cursor inside the log, after the emoji:
  //
  // Example: console.log('🦆|')
  const newPosition = new Position(
    lineOfSelectedVariable,
    debuggingMessage.indexOf(logFunction) + logFunction.length + 4,
  );
  editor.selection = new Selection(newPosition, newPosition);
}

async function baseDebuggingMessage(
  editor: TextEditor,
  lineOfLogMessage: number,
  debuggingMessage: string,
  insertEmptyLineBeforeLogMessage: boolean,
  insertEmptyLineAfterLogMessage: boolean,
): Promise<void> {
  await editor.edit((textEdit) => {
    const { lineCount } = editor.document;
    textEdit.insert(
      new Position(Math.min(lineOfLogMessage, lineCount), 0),
      `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
        lineOfLogMessage === lineCount ? '\n' : ''
      }${debuggingMessage}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
    );
  });
}

function getLogMessageInfo(
  document: TextDocument,
  selectionLine: number,
): LogMessageInfo {
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
    [key in LogMessageType]: () => LogMessageInfo | undefined;
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
        isArrowFunction(currentLineText) &&
        shouldTransformArrowFunction(currentLineText)
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
 * Returns true if we should add an empty line after a log.
 */
function shouldInsertEmptyLineBeforeLogMessage(
  lineOfLogMessage: number,
  lineOfSelectedVariable: number,
) {
  return lineOfLogMessage - lineOfSelectedVariable > 1;
}

/**
 * Returns true if we should add an empty line in front of a log.
 *
 * - When we insert a log message on top of another log message
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

/**
 * We're adding a console.log() to an empty line.
 */
function isEmptyLineContext(currentLineText: string) {
  return currentLineText.trim() === '';
}

/**
 * We're adding a console.log() for an arrow function parameter.
 */
function isArrowFunctionArgumentContext(
  selectedVariable: string,
  selectedVariableLineText: string,
) {
  return (
    isArgumentOfArrowFunction(selectedVariableLineText, selectedVariable) &&
    shouldTransformArrowFunction(selectedVariableLineText)
  );
}

function isEmptyBlockContext(
  document: TextDocument,
  logMessage: LogMessageInfo,
) {
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

async function emptyBlockDebuggingMessage(
  editor: TextEditor,
  emptyBlockLine: TextLine,
  logMessageLine: number,
  debuggingMessage: string,
  spacesBeforeMessage: string,
) {
  if (/\){.*}/.test(emptyBlockLine.text.replaceAll(/\s/g, ''))) {
    const textBeforeClosedFunctionParenthesis =
      emptyBlockLine.text.split(')')[0];
    await editor.edit((textEdit) => {
      const { lineCount } = editor.document;
      textEdit.delete(emptyBlockLine.rangeIncludingLineBreak);
      textEdit.insert(
        new Position(Math.min(logMessageLine, lineCount), 0),
        `${textBeforeClosedFunctionParenthesis}) {\n${
          logMessageLine === lineCount ? '\n' : ''
        }${spacesBeforeMessage}${debuggingMessage}\n${spacesBeforeMessage}}\n`,
      );
    });
  }
}

/**
 * Returns an empty console.log() statement.
 *
 * Example: console.log('🦆');
 */
function getEmptyConsoleLog(
  { quote, semicolon }: CodeStyle,
  logFunction: string,
) {
  const emoji = getRandomEmoji();
  const message = `${quote}${emoji}${quote}`;
  return `${logFunction}(${message})${semicolon}`;
}

/**
 * Returns a console.log() statement.
 *
 * Example: console.log('🦆 foo', foo);
 */
function getConsoleLog(
  { quote, semicolon }: CodeStyle,
  logFunction: string,
  variable: string,
) {
  const emoji = getRandomEmoji();
  const message = `${quote}${emoji} ${variable}${quote}`;
  return `${logFunction}(${message}, ${variable})${semicolon}`;
}

export async function insertMessage(
  editor: TextEditor,
  selectedVariable: string,
  lineOfSelectedVariable: number,
  style: CodeStyle,
  { logFunction }: ExtensionProperties,
): Promise<void> {
  const { document } = editor;
  const logMessageInfo = getLogMessageInfo(document, lineOfSelectedVariable);
  const lineOfLogMessage = debugMessageLine(
    editor.document,
    lineOfSelectedVariable,
    selectedVariable,
    logMessageInfo,
  );
  const spacesBeforeMessage = spacesBeforeLogMessage(
    editor.document,
    lineOfSelectedVariable,
    lineOfLogMessage,
  );

  const selectedVariableLine = document.lineAt(lineOfSelectedVariable);
  const selectedVariableLineText = selectedVariableLine.text;
  logDebugMessage('Line under cursor:', selectedVariableLineText);

  const insertEmptyLineBeforeLogMessage = shouldInsertEmptyLineBeforeLogMessage(
    lineOfLogMessage,
    lineOfSelectedVariable,
  );
  const insertEmptyLineAfterLogMessage = shouldInsertEmptyLineAfterLogMessage(
    document,
    lineOfLogMessage,
    logFunction,
  );
  logDebugMessage('Add empty line before:', insertEmptyLineBeforeLogMessage);
  logDebugMessage('Add empty line after:', insertEmptyLineAfterLogMessage);

  const debuggingMessageContent = selectedVariable
    ? getConsoleLog(style, logFunction, selectedVariable)
    : getEmptyConsoleLog(style, logFunction);
  const debuggingMessage = `${spacesBeforeMessage}${debuggingMessageContent}`;

  if (isEmptyLineContext(selectedVariableLineText)) {
    logDebugMessage('Empty line context');

    return emptyLineDebuggingMessage(
      editor,
      lineOfSelectedVariable,
      debuggingMessage,
      logFunction,
    );
  }

  if (isEmptyBlockContext(document, logMessageInfo)) {
    logDebugMessage('Empty block context');

    const emptyBlockLine =
      logMessageInfo.type === LogMessageType.MultilineParenthesis
        ? document.lineAt(logMessageInfo.metadata.closingContextLine)
        : (logMessageInfo.type === LogMessageType.NamedFunction
          ? document.lineAt(logMessageInfo.metadata.line)
          : undefined);
    if (emptyBlockLine) {
      return emptyBlockDebuggingMessage(
        editor,
        emptyBlockLine,
        lineOfLogMessage,
        debuggingMessageContent,
        spacesBeforeMessage,
      );
    }
    return;
  }

  if (
    isArrowFunctionArgumentContext(selectedVariable, selectedVariableLineText)
  ) {
    logDebugMessage('Anonymous function context', selectedVariable);

    return anonymousPropertyDebuggingMessage(
      editor,
      style,
      selectedVariableLine,
      debuggingMessageContent,
    );
  }

  return baseDebuggingMessage(
    editor,
    lineOfLogMessage,
    debuggingMessage,
    insertEmptyLineBeforeLogMessage,
    insertEmptyLineAfterLogMessage,
  );
}
