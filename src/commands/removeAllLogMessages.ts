import * as vscode from 'vscode';
import { ExtensionProperties, Message } from '../types';
import { detectAllLogs } from '../utilities/detectAllLogs';

export async function removeAllLogMessagesCommand({
  logFunction,
}: ExtensionProperties) {
  const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const document: vscode.TextDocument = editor.document;
  const logMessages: Message[] = detectAllLogs(document, logFunction);
  await editor.edit((editBuilder) => {
    for (const { lines } of logMessages) {
      const firstLine = lines[0];
      const lastLine = lines.at(-1);
      const lineBeforeFirstLine = new vscode.Range(
        new vscode.Position(firstLine.start.line - 1, 0),
        new vscode.Position(firstLine.end.line - 1, 0),
      );
      const lineAfterLastLine = new vscode.Range(
        new vscode.Position(lastLine?.start.line ?? 0 + 1, 0),
        new vscode.Position(lastLine?.end.line ?? 0 + 1, 0),
      );
      if (document.lineAt(lineBeforeFirstLine.start).text === '') {
        editBuilder.delete(lineBeforeFirstLine);
      }
      if (document.lineAt(lineAfterLastLine.start).text === '') {
        editBuilder.delete(lineAfterLastLine);
      }
      for (const line of lines) {
        editBuilder.delete(line);
      }
    }
  });
}
