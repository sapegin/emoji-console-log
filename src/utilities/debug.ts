import { window } from 'vscode';

const debug = window.createOutputChannel('Emoji Console Log');

export function logDebugMessage(...messages: unknown[]) {
  debug.appendLine(
    messages
      .map((x) =>
        typeof x === 'string' || typeof x === 'number' ? x : JSON.stringify(x),
      )
      .join(' '),
  );
}
