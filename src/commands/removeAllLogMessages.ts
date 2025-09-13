import { Position, Range, window, type TextEditor } from 'vscode';
import { ExtensionProperties } from '../types/ExtensionProperties';
import { detectAllLogs } from '../utilities/detectAllLogs';

export async function removeAllLogMessagesCommand({
  logFunction,
}: ExtensionProperties) {
  const editor: TextEditor | undefined = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const { document } = editor;
  const logMessages = detectAllLogs(document, logFunction);
  await editor.edit((editBuilder) => {
    for (const { lines } of logMessages) {
      const firstLine = lines[0];
      const lastLine = lines.at(-1);
      const lineBeforeFirstLine = new Range(
        new Position(firstLine.start.line - 1, 0),
        new Position(firstLine.end.line - 1, 0),
      );
      const lineAfterLastLine = new Range(
        new Position(lastLine?.start.line ?? 0 + 1, 0),
        new Position(lastLine?.end.line ?? 0 + 1, 0),
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
