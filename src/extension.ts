import { commands, workspace, type WorkspaceConfiguration } from 'vscode';
import { ExtensionProperties } from './types';
import { addLogMessageCommand } from './commands/addLogMessage';
import { commentAllLogMessagesCommand } from './commands/commentAllLogMessages';
import { uncommentAllLogMessagesCommand } from './commands/uncommentAllLogMessages';
import { removeAllLogMessagesCommand } from './commands/removeAllLogMessages';

function getExtensionProperties(
  workspaceConfig: WorkspaceConfiguration,
): ExtensionProperties {
  return {
    logFunction: workspaceConfig.logFunction ?? 'console.log',
  };
}

export function activate(): void {
  const config = workspace.getConfiguration('emojiConsoleLog');
  const properties = getExtensionProperties(config);
  commands.registerCommand('emojiConsoleLog.addLogMessage', () => {
    addLogMessageCommand(properties);
  });
  commands.registerCommand('emojiConsoleLog.commentAllLogMessages', () => {
    commentAllLogMessagesCommand(properties);
  });
  commands.registerCommand('emojiConsoleLog.uncommentAllLogMessages', () => {
    uncommentAllLogMessagesCommand(properties);
  });
  commands.registerCommand('emojiConsoleLog.removeAllLogMessages', () => {
    removeAllLogMessagesCommand(properties);
  });
}
