import type { TextDocument } from 'vscode';

export function spacesBeforeLogMessage(
  document: TextDocument,
  selectedVariableLine: number,
  logMessageLine: number,
): string {
  const selectedVariableTextLine = document.lineAt(selectedVariableLine);
  const selectedVariableTextLineFirstNonWhitespaceCharacterIndex =
    selectedVariableTextLine.firstNonWhitespaceCharacterIndex;
  const spacesBeforeSelectedVariableLine = [...selectedVariableTextLine.text]
    .splice(0, selectedVariableTextLineFirstNonWhitespaceCharacterIndex)
    .reduce((previousValue, currentValue) => previousValue + currentValue, '');
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
