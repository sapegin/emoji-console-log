import { window, type Selection, type TextDocument } from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties } from '../types';
import { getFileCodeStyle } from '../utilities';
import { logDebugMessage } from '../utilities/debug';

// TODO: We should remove all existing useless and broken tests and start
// testing utility functions like the one below

// An identifier optionally suffixed by any number of property accessors [...]
const entityRegExp = /[\w.?]+(\["[^"]+"])*(\['[^']+'])*(\[\d+])*/;

/**
 * Returns a symbol under cursor or en empty string:
 * tacoCat
 * taco.cat
 * taco['cat']
 * taco[13]
 * taco?.cat
 */
function getEntityUnderCursor(document: TextDocument, selection: Selection) {
  const rangeUnderCursor = document.getWordRangeAtPosition(
    selection.active,
    entityRegExp,
  );

  // If range is undefined, `document.getText(undefined)` will return the entire file.
  if (rangeUnderCursor) {
    return document.getText(rangeUnderCursor);
  } else {
    return '';
  }
}

export function addLogMessageCommand(): Command {
  return {
    name: 'emojiConsoleLog.addLogMessage',
    handler: async (
      extensionProperties: ExtensionProperties,
      debugMessage: DebugMessage,
    ) => {
      const editor = window.activeTextEditor;
      if (!editor) {
        return;
      }

      const style = await getFileCodeStyle(
        editor.document.fileName,
        editor.options,
      );

      for (let index = 0; index < editor.selections.length; index++) {
        const selection = editor.selections[index];

        const wordUnderCursor = getEntityUnderCursor(
          editor.document,
          selection,
        );

        const selectedVariable =
          editor.document.getText(selection) || wordUnderCursor;
        const lineOfSelectedVariable = selection.active.line;

        logDebugMessage(
          `Insert log with selected variable '${selectedVariable}'`,
        );

        await editor.edit((editBuilder) => {
          debugMessage.insertMessage(
            editBuilder,
            editor.document,
            selectedVariable,
            lineOfSelectedVariable,
            style,
            extensionProperties,
          );
        });
      }
    },
  };
}
