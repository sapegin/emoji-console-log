import type { TextDocument } from 'vscode';
import { BracketType, type Message } from '../types';
import { spacesBeforeLogMessage } from './spacesBeforeLogMessage';
import { closingContextLine } from './closingContextLine';
import { emojis } from './emojis';

export function detectAllLogs(
  document: TextDocument,
  logFunction: string,
): Message[] {
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
      logMessage.spaces = spacesBeforeLogMessage(document, index, index);
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
