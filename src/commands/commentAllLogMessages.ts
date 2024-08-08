import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../types';

export function commentAllLogMessagesCommand(): Command {
  return {
    name: 'emojiConsoleLog.commentAllLogMessages',
    handler: async (
      { logFunction }: ExtensionProperties,
      jsDebugMessage: DebugMessage,
      commandArguments?: unknown[],
    ) => {
      function logFunctionToUse(): string {
        if (
          commandArguments &&
          commandArguments.length > 0 &&
          typeof commandArguments[0] === 'object' &&
          commandArguments[0] !== null
        ) {
          const firstArgument = commandArguments[0] as Record<string, unknown>;
          if (
            'logFunction' in firstArgument &&
            typeof firstArgument.logFunction === 'string'
          ) {
            return firstArgument.logFunction;
          }
          return logFunction;
        }
        return logFunction;
      }

      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        logFunctionToUse(),
      );
      editor.edit((editBuilder) => {
        for (const { spaces, lines } of logMessages) {
          for (const line of lines) {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}// ${document.getText(line).trim()}\n`,
            );
          }
        }
      });
    },
  };
}
