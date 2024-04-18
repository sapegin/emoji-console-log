import { addLogMessageCommand } from './addLogMessage';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
import { removeAllLogMessagesCommand } from './removeAllLogMessages';
import { Command } from '../entities';
export function getAllCommands(): Command[] {
  return [
    addLogMessageCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    removeAllLogMessagesCommand(),
  ];
}
