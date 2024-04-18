import { window } from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties } from '../entities';
import { getFileCodeStyle } from '../utilities';

export function displayLogMessageCommand(): Command {
  return {
    name: 'emojiConsoleLog.displayLogMessage',
    handler: async (
      extensionProperties: ExtensionProperties,
      jsDebugMessage: DebugMessage,
    ) => {
      const editor = window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document = editor.document;

      const style = await getFileCodeStyle(document.fileName, editor.options);

      for (let index = 0; index < editor.selections.length; index++) {
        const selection = editor.selections[index];
        let wordUnderCursor = '';
        const rangeUnderCursor = document.getWordRangeAtPosition(
          selection.active,
        );
        // if rangeUnderCursor is undefined, `document.getText(undefined)` will return the entire file.
        if (rangeUnderCursor) {
          wordUnderCursor = document.getText(rangeUnderCursor);
        }
        const selectedVar = document.getText(selection) || wordUnderCursor;
        const lineOfSelectedVar = selection.active.line;
        if (selectedVar.trim().length !== 0) {
          await editor.edit((editBuilder) => {
            jsDebugMessage.msg(
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              style,
              extensionProperties,
            );
          });
        }
      }
    },
  };
}
