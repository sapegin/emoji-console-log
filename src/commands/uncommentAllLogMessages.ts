import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';

export function uncommentAllLogMessagesCommand(): Command {
  return {
    name: 'emojiConsoleLog.uncommentAllLogMessages',
    handler: async (
      { logFunction }: ExtensionProperties,
      jsDebugMessage: DebugMessage,
    ) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;

      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        logFunction,
      );
      editor.edit((editBuilder) => {
        for (const { spaces, lines } of logMessages) {
          for (const line of lines) {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${document.getText(line).replaceAll('/', '').trim()}\n`,
            );
          }
        }
      });
    },
  };
}
