import { TextDocument } from 'vscode';
import { LogMessage } from '../types';

export interface DebugMessageLine {
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
    logMessage: LogMessage,
  ): number;
}
