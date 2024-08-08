import { window } from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties } from '../types';
import { getFileCodeStyle } from '../utilities';

export function addLogMessageCommand(): Command {
  return {
    name: 'emojiConsoleLog.addLogMessage',
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
        const selectedVariable = document.getText(selection) || wordUnderCursor;
        const lineOfSelectedVariable = selection.active.line;
        if (selectedVariable.trim().length > 0) {
          await editor.edit((editBuilder) => {
            jsDebugMessage.msg(
              editBuilder,
              document,
              selectedVariable,
              lineOfSelectedVariable,
              style,
              extensionProperties,
            );
          });
        }
      }
    },
  };
}
