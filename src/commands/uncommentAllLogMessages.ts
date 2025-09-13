import { Position, window, type TextEditor } from 'vscode';
import { ExtensionProperties } from '../types/ExtensionProperties';
import { detectAllLogs } from '../utilities/detectAllLogs';

export async function uncommentAllLogMessagesCommand({
  logFunction,
}: ExtensionProperties) {
  const editor: TextEditor | undefined = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const { document } = editor;
  const logMessages = detectAllLogs(document, logFunction);
  await editor.edit((editBuilder) => {
    for (const { spaces, lines } of logMessages) {
      for (const line of lines) {
        editBuilder.delete(line);
        editBuilder.insert(
          new Position(line.start.line, 0),
          `${spaces}${document.getText(line).replaceAll('/', '').trim()}\n`,
        );
      }
    }
  });
}
