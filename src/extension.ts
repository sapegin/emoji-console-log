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
    vscode.commands.registerCommand(name, (commandArguments: unknown[]) => {
      handler(properties, jsDebugMessage, commandArguments);
    });
  }
}
