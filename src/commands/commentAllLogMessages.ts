import * as vscode from 'vscode';
import { ExtensionProperties, Message } from '../types';
import { detectAllLogs } from '../utilities/detectAllLogs';

export async function commentAllLogMessagesCommand({
  logFunction,
}: ExtensionProperties) {
  const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document: vscode.TextDocument = editor.document;
  const logMessages: Message[] = detectAllLogs(document, logFunction);
  await editor.edit((editBuilder) => {
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
}
