import { addLogMessageCommand } from './addLogMessage';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
import { removeAllLogMessagesCommand } from './removeAllLogMessages';
import { Command } from '../types';
export function getAllCommands(): Command[] {
  return [
    addLogMessageCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    removeAllLogMessagesCommand(),
  ];
}
