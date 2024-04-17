export type ExtensionProperties = {
  insertEmptyLineBeforeLogMessage: boolean;
  insertEmptyLineAfterLogMessage: boolean;
  logType: enumLogType;
  logFunction: string;
};

enum enumLogType {
  log = 'log',
  warn = 'warn',
  error = 'error',
  debug = 'debug',
  table = 'table',
}
