import * as vscode from 'vscode';
import { JSDebugMessage } from './debug-message/js';
import { ExtensionProperties } from './entities';
import { JSLineCodeProcessing } from './line-code-processing/js';
import { getAllCommands } from './commands/';
import { JSDebugMessageLine } from './debug-message/js/JSDebugMessageLine';

function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
): ExtensionProperties {
  return {
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    logFunction: workspaceConfig.logFunction ?? 'console.log',
  };
}

export function activate(): void {
  const jsLineCodeProcessing = new JSLineCodeProcessing();
  const debugMessageLine = new JSDebugMessageLine(jsLineCodeProcessing);
  const jsDebugMessage = new JSDebugMessage(
    jsLineCodeProcessing,
    debugMessageLine,
  );
  const config = vscode.workspace.getConfiguration('emojiConsoleLog');
  const properties = getExtensionProperties(config);
  const commands = getAllCommands();
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler(properties, jsDebugMessage, args);
    });
  }
}
