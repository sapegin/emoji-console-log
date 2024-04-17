import * as vscode from 'vscode';
import { DebugMessage } from './debug-message';
import { JSDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { LineCodeProcessing } from './line-code-processing';
import { JSLineCodeProcessing } from './line-code-processing/js';
import { getAllCommands } from './commands/';
import { DebugMessageLine } from './debug-message/DebugMessageLine';
import { JSDebugMessageLine } from './debug-message/js/JSDebugMessageLine';

function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
) {
  return {
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    logFunction: workspaceConfig.logFunction ?? 'console.log',
  };
}

export function activate(): void {
  const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
  const debugMessageLine: DebugMessageLine = new JSDebugMessageLine(
    jsLineCodeProcessing,
  );
  const jsDebugMessage: DebugMessage = new JSDebugMessage(
    jsLineCodeProcessing,
    debugMessageLine,
  );
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('emojiConsoleLog');
  const properties: ExtensionProperties = getExtensionProperties(config);
  const commands: Command[] = getAllCommands();
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler(properties, jsDebugMessage, args);
    });
  }
}
