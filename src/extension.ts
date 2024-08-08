import * as vscode from 'vscode';
import { DebugMessage } from './debug-message';
import { ExtensionProperties } from './types';
import { getAllCommands } from './commands/';
import { DebugMessageLine } from './debug-message/DebugMessageLine';

function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
): ExtensionProperties {
  return {
    logFunction: workspaceConfig.logFunction ?? 'console.log',
  };
}

export function activate(): void {
  const debugMessageLine = new DebugMessageLine();
  const debugMessage = new DebugMessage(debugMessageLine);
  const config = vscode.workspace.getConfiguration('emojiConsoleLog');
  const properties = getExtensionProperties(config);
  const commands = getAllCommands();
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (commandArguments: unknown[]) => {
      handler(properties, debugMessage, commandArguments);
    });
  }
}
