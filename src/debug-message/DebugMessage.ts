import { TextDocument, TextEditorEdit } from 'vscode';
import { LineCodeProcessing } from '../line-code-processing';
import { CodeStyle } from '../utilities';
import { DebugMessageLine } from './DebugMessageLine';
import type {
  LogMessage,
  ExtensionProperties,
  Message,
  BlockType,
} from '../types';

export abstract class DebugMessage {
  lineCodeProcessing: LineCodeProcessing;
  debugMessageLine: DebugMessageLine;
  constructor(
    lineCodeProcessing: LineCodeProcessing,
    debugMessageLine: DebugMessageLine,
  ) {
    this.lineCodeProcessing = lineCodeProcessing;
    this.debugMessageLine = debugMessageLine;
  }
  abstract logMessage(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
  ): LogMessage;
  abstract msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVariable: string,
    lineOfSelectedVariable: number,
    style: CodeStyle,
    extensionProperties: ExtensionProperties,
  ): void;
  abstract detectAll(document: TextDocument, logFunction: string): Message[];
  abstract enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVariable: number,
    blockType: BlockType,
  ): string;
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
    logMessage: LogMessage,
  ): number {
    return this.debugMessageLine.line(
      document,
      selectionLine,
      selectedVariable,
      logMessage,
    );
  }
  spacesBeforeLogMsg(
    document: TextDocument,
    selectedVariableLine: number,
    logMessageLine: number,
  ): string {
    const selectedVariableTextLine = document.lineAt(selectedVariableLine);
    const selectedVariableTextLineFirstNonWhitespaceCharacterIndex =
      selectedVariableTextLine.firstNonWhitespaceCharacterIndex;
    const spacesBeforeSelectedVariableLine = [...selectedVariableTextLine.text]
      .splice(0, selectedVariableTextLineFirstNonWhitespaceCharacterIndex)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        '',
      );
    if (logMessageLine < document.lineCount) {
      const logMessageTextLine = document.lineAt(logMessageLine);
      const logMessageTextLineFirstNonWhitespaceCharacterIndex =
        logMessageTextLine.firstNonWhitespaceCharacterIndex;
      const spacesBeforeLogMessageLine = [...logMessageTextLine.text]
        .splice(0, logMessageTextLineFirstNonWhitespaceCharacterIndex)
        .reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          '',
        );
      return spacesBeforeSelectedVariableLine.length >
        spacesBeforeLogMessageLine.length
        ? spacesBeforeSelectedVariableLine
        : spacesBeforeLogMessageLine;
    }
    return spacesBeforeSelectedVariableLine;
  }
}
