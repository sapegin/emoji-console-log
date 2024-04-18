import { addLogMessageCommand } from './addLogMessage';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
import { deleteAllLogMessagesCommand } from './deleteAllLogMessages';
import { Command } from '../entities';
export function getAllCommands(): Command[] {
  return [
    addLogMessageCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    deleteAllLogMessagesCommand(),
  ];
}
