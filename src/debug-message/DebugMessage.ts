import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import {
  BlockType,
  ExtensionProperties,
  BracketType,
  LogMessageType,
  Message,
  LogMessage,
} from '../types';
import { LineCodeProcessing } from '../line-code-processing';
import sortBy from 'lodash/sortBy';
import { DebugMessageLine } from './DebugMessageLine';
import {
  getMultiLineContextVariable,
  closingContextLine,
  getRandomEmoji,
  emojis,
  CodeStyle,
} from '../utilities';
import { DebugMessageAnonymous } from './DebugMessageAnonymous';
import { LogContextMetadata, NamedFunctionMetadata } from '../types/LogMessage';

const logMessageTypeVerificationPriority = sortBy(
  [
    { logMessageType: LogMessageType.ArrayAssignment, priority: 2 },
    { logMessageType: LogMessageType.ObjectLiteral, priority: 3 },
    {
      logMessageType: LogMessageType.ObjectFunctionCallAssignment,
      priority: 4,
    },
    { logMessageType: LogMessageType.NamedFunction, priority: 6 },
    { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 5 },
    { logMessageType: LogMessageType.MultiLineAnonymousFunction, priority: 7 },
    { logMessageType: LogMessageType.MultilineParenthesis, priority: 8 },
    { logMessageType: LogMessageType.MultilineBraces, priority: 9 },
    { logMessageType: LogMessageType.PrimitiveAssignment, priority: 10 },
    { logMessageType: LogMessageType.Decorator, priority: 0 },
    { logMessageType: LogMessageType.Ternary, priority: 1 },
  ],
  'priority',
);

export class DebugMessage {
  lineCodeProcessing: LineCodeProcessing;
  debugMessageLine: DebugMessageLine;
  jsDebugMessageAnonymous: DebugMessageAnonymous;

  constructor(
    lineCodeProcessing: LineCodeProcessing,
    debugMessageLine: DebugMessageLine,
  ) {
    this.lineCodeProcessing = lineCodeProcessing;
    this.debugMessageLine = debugMessageLine;
    this.jsDebugMessageAnonymous = new DebugMessageAnonymous(
      lineCodeProcessing,
    );
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
    if (logMessage.logMessageType === LogMessageType.MultilineParenthesis) {
      return /\){.*}/.test(
        document
          .lineAt(
            (logMessage.metadata as LogContextMetadata).closingContextLine,
          )
          .text.replaceAll(/\s/g, ''),
      );
    }
    if (logMessage.logMessageType === LogMessageType.NamedFunction) {
      return /\){.*}/.test(
        document
          .lineAt((logMessage.metadata as NamedFunctionMetadata).line)
          .text.replaceAll(/\s/g, ''),
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

  private deepObjectProperty(
    document: TextDocument,
    line: number,
    path = '',
  ): { path: string; line: number } | undefined {
    const lineText = document.lineAt(line).text;
    const propertyNameRegex = /(\w+):\s*{/;
    const propertyNameRegexMatch = propertyNameRegex.exec(lineText);
    if (propertyNameRegexMatch) {
      const multilineBracesVariable = getMultiLineContextVariable(
        document,
        line,
        BracketType.CURLY_BRACES,
      );
      if (multilineBracesVariable) {
        return this.deepObjectProperty(
          document,
          multilineBracesVariable.openingContextLine,
          `${propertyNameRegexMatch[1]}.${path}`,
        );
      }
    } else if (
      this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
        `${document.lineAt(line).text}${document.lineAt(line + 1).text})}`,
      )
    ) {
      return {
        path: `${document
          .lineAt(line)
          .text.split('=')[0]
          .replace(/(const|let|var)/, '')
          .trim()}.${path}`,
        line: closingContextLine(document, line, BracketType.CURLY_BRACES),
      };
    }
    return undefined;
  }

  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVariable: string,
    lineOfSelectedVariable: number,
    style: CodeStyle,
    { logFunction }: ExtensionProperties,
  ): void {
    const logMessage = this.logMessage(
      document,
      lineOfSelectedVariable,
      selectedVariable,
    );
    const lineOfLogMessage = this.line(
      document,
      lineOfSelectedVariable,
      selectedVariable,
      logMessage,
    );
    const spacesBeforeMessage = this.spacesBeforeLogMsg(
      document,
      (logMessage.metadata as LogContextMetadata)?.deepObjectLine ??
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

    const variableToLog =
      (logMessage.metadata as LogContextMetadata)?.deepObjectPath ??
      selectedVariable;
    const message = `${style.quote}${getRandomEmoji()} ${variableToLog}${style.quote}`;
    const debuggingMessageContent = `${logFunction}(${message}, ${variableToLog})${style.semicolon}`;
    const debuggingMessage = `${spacesBeforeMessage}${debuggingMessageContent}`;
    const selectedVariableLine = document.lineAt(lineOfSelectedVariable);
    const selectedVariableLineLoc = selectedVariableLine.text;
    if (this.isEmptyBlockContext(document, logMessage)) {
      const emptyBlockLine =
        logMessage.logMessageType === LogMessageType.MultilineParenthesis
          ? document.lineAt(
              (logMessage.metadata as LogContextMetadata).closingContextLine,
            )
          : document.lineAt(
              (logMessage.metadata as NamedFunctionMetadata).line,
            );
      this.emptyBlockDebuggingMsg(
        document,
        textEditor,
        emptyBlockLine,
        lineOfLogMessage,
        debuggingMessageContent,
        spacesBeforeMessage,
      );
      return;
    }
    if (
      this.jsDebugMessageAnonymous.isAnonymousFunctionContext(
        selectedVariable,
        selectedVariableLineLoc,
      )
    ) {
      this.jsDebugMessageAnonymous.anonymousPropDebuggingMsg(
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
  logMessage(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
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
      [key in LogMessageType]: () => {
        isChecked: boolean;
        metadata?: Pick<LogMessage, 'metadata'>;
      };
    } = {
      [LogMessageType.ObjectLiteral]: () => {
        if (document.lineCount === selectionLine + 1) {
          return {
            isChecked: false,
          };
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
                return {
                  isChecked: false,
                };
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
            return {
              isChecked: false,
            };
          }
          nextLineText = document
            .lineAt(nextLineIndex)
            .text.replaceAll(/\s/g, '');
        }

        const combinedText = `${currentLineText}${nextLineText}`;
        return {
          isChecked:
            this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
              combinedText,
            ),
        };
      },

      [LogMessageType.Decorator]: () => {
        return {
          isChecked: /^@[\dA-Za-z]+(.*)[\dA-Za-z]+/.test(
            currentLineText.trim(),
          ),
        };
      },
      [LogMessageType.ArrayAssignment]: () => {
        return {
          isChecked: this.lineCodeProcessing.isArrayAssignedToVariable(
            `${currentLineText}\n${currentLineText}`,
          ),
        };
      },
      [LogMessageType.Ternary]: () => {
        return {
          isChecked: /`/.test(currentLineText),
        };
      },
      [LogMessageType.MultilineBraces]: () => {
        const isChecked =
          multilineBracesVariable &&
          !this.lineCodeProcessing.isAssignedToVariable(currentLineText) &&
          !this.lineCodeProcessing.isAffectationToVariable(currentLineText);

        if (isChecked && multilineBracesVariable) {
          const deepObjectProperty = this.deepObjectProperty(
            document,
            multilineBracesVariable.openingContextLine,
            selectedVariable,
          );
          if (deepObjectProperty) {
            const multilineBracesObjectScope = getMultiLineContextVariable(
              document,
              deepObjectProperty.line,
              BracketType.CURLY_BRACES,
            );
            return {
              isChecked: true,
              metadata: {
                openingContextLine:
                  multilineBracesObjectScope?.openingContextLine as number,
                closingContextLine:
                  multilineBracesObjectScope?.closingContextLine as number,
                deepObjectLine: deepObjectProperty.line,
                deepObjectPath: deepObjectProperty.path,
              } as Pick<LogMessage, 'metadata'>,
            };
          }
          return {
            isChecked: true,
            metadata: {
              openingContextLine:
                multilineBracesVariable?.openingContextLine as number,
              closingContextLine:
                multilineBracesVariable?.closingContextLine as number,
            } as Pick<LogMessage, 'metadata'>,
          };
        }
        return {
          isChecked: false,
        };
      },
      [LogMessageType.MultilineParenthesis]: () => {
        const isChecked = multilineParenthesisVariable !== null;
        if (isChecked) {
          const isOpeningCurlyBraceContext = document
            .lineAt(multilineParenthesisVariable?.closingContextLine as number)
            .text.includes('{');
          const isOpeningParenthesisContext = document
            .lineAt(selectionLine)
            .text.includes('(');
          if (isOpeningCurlyBraceContext || isOpeningParenthesisContext) {
            if (this.lineCodeProcessing.isAssignedToVariable(currentLineText)) {
              return {
                isChecked: true,
                metadata: {
                  openingContextLine: selectionLine,
                  closingContextLine: closingContextLine(
                    document,
                    multilineParenthesisVariable?.closingContextLine as number,
                    isOpeningCurlyBraceContext
                      ? BracketType.CURLY_BRACES
                      : BracketType.PARENTHESIS,
                  ),
                } as Pick<LogMessage, 'metadata'>,
              };
            }
            return {
              isChecked: true,
              metadata: {
                openingContextLine:
                  multilineParenthesisVariable?.openingContextLine as number,
                closingContextLine:
                  multilineParenthesisVariable?.closingContextLine as number,
              } as Pick<LogMessage, 'metadata'>,
            };
          }
        }
        return {
          isChecked: false,
        };
      },
      [LogMessageType.ObjectFunctionCallAssignment]: () => {
        if (document.lineCount === selectionLine + 1) {
          return {
            isChecked: false,
          };
        }
        const nextLineText: string = document
          .lineAt(selectionLine + 1)
          .text.replaceAll(/\s/g, '');
        return {
          isChecked:
            this.lineCodeProcessing.isObjectFunctionCall(
              `${currentLineText}\n${nextLineText}`,
            ) && this.lineCodeProcessing.isAssignedToVariable(currentLineText),
        };
      },
      [LogMessageType.NamedFunction]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
              currentLineText,
            ),
          metadata: {
            line: selectionLine,
          } as Pick<LogMessage, 'metadata'>,
        };
      },
      [LogMessageType.NamedFunctionAssignment]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.isFunctionAssignedToVariable(
              `${currentLineText}`,
            ) && multilineParenthesisVariable === null,
        };
      },
      [LogMessageType.MultiLineAnonymousFunction]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.isFunctionAssignedToVariable(
              `${currentLineText}`,
            ) &&
            this.lineCodeProcessing.isAnonymousFunction(currentLineText) &&
            this.lineCodeProcessing.shouldTransformAnonymousFunction(
              currentLineText,
            ),
        };
      },
      [LogMessageType.PrimitiveAssignment]: () => {
        return {
          isChecked:
            this.lineCodeProcessing.isAssignedToVariable(currentLineText),
        };
      },
    };

    for (const { logMessageType } of logMessageTypeVerificationPriority) {
      const { isChecked, metadata } =
        logMessageTypesChecks[
          logMessageType as keyof typeof logMessageTypesChecks
        ]();
      if (logMessageType !== LogMessageType.PrimitiveAssignment && isChecked) {
        return {
          logMessageType,
          metadata,
        };
      }
    }
    return {
      logMessageType: LogMessageType.PrimitiveAssignment,
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
            this.lineCodeProcessing.doesContainClassDeclaration(
              currentLineText,
            ) &&
            lineOfSelectedVariable > currentLineNumber &&
            lineOfSelectedVariable <
              closingContextLine(
                document,
                currentLineNumber,
                BracketType.CURLY_BRACES,
              )
          ) {
            return `${this.lineCodeProcessing.getClassName(currentLineText)}`;
          }
          break;
        }
        case 'function': {
          if (
            this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(
              currentLineText,
            ) &&
            !this.lineCodeProcessing.doesContainsBuiltInFunction(
              currentLineText,
            ) &&
            lineOfSelectedVariable >= currentLineNumber &&
            lineOfSelectedVariable <
              closingContextLine(
                document,
                currentLineNumber,
                BracketType.CURLY_BRACES,
              )
          ) {
            if (
              this.lineCodeProcessing.getFunctionName(currentLineText).length >
              0
            ) {
              return `${this.lineCodeProcessing.getFunctionName(
                currentLineText,
              )}`;
            }
            return '';
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
