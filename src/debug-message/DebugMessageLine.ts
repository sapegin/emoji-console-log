import { TextDocument } from 'vscode';
import { BracketType, LogMessageType, type LogMessageCheck } from '../types';
import { getMultiLineContextVariable } from '../utilities';
import { LineCodeProcessing } from '../line-code-processing';

export class DebugMessageLine {
  lineCodeProcessing: LineCodeProcessing;
  constructor(lineCodeProcessing: LineCodeProcessing) {
    this.lineCodeProcessing = lineCodeProcessing;
  }
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
    logMessage: LogMessageCheck,
  ): number {
    switch (logMessage.type) {
      case LogMessageType.ObjectLiteral: {
        return this.objectLiteralLine(document, selectionLine);
      }
      case LogMessageType.NamedFunctionAssignment: {
        return this.functionAssignmentLine(
          document,
          selectionLine,
          selectedVariable,
        );
      }
      case LogMessageType.Decorator: {
        return (
          (getMultiLineContextVariable(
            document,
            selectionLine,
            BracketType.PARENTHESIS,
            false,
          )?.closingContextLine || selectionLine) + 1
        );
      }
      case LogMessageType.MultiLineAnonymousFunction: {
        return (
          this.functionClosedLine(
            document,
            selectionLine,
            BracketType.CURLY_BRACES,
          ) + 1
        );
      }
      case LogMessageType.ObjectFunctionCallAssignment: {
        return this.objectFunctionCallLine(
          document,
          selectionLine,
          selectedVariable,
        );
      }
      case LogMessageType.ArrayAssignment: {
        return this.arrayLine(document, selectionLine);
      }
      case LogMessageType.MultilineParenthesis: {
        return (logMessage.metadata.closingContextLine || selectionLine) + 1;
      }
      case LogMessageType.Ternary: {
        return this.templateStringLine(document, selectionLine);
      }
      case LogMessageType.MultilineBraces: {
        // Deconstructing assignment
        if (logMessage.metadata.closingContextLine) {
          return logMessage.metadata.closingContextLine + 1;
        }
        return selectionLine + 1;
      }
      default: {
        return selectionLine + 1;
      }
    }
  }
  private objectLiteralLine(
    document: TextDocument,
    selectionLine: number,
  ): number {
    const currentLineText: string = document.lineAt(selectionLine).text;
    let nbrOfOpenedBrackets: number = (currentLineText.match(/{/g) || [])
      .length;
    let nbrOfClosedBrackets: number = (currentLineText.match(/}/g) || [])
      .length;
    let currentLineNumber: number = selectionLine + 1;
    while (currentLineNumber < document.lineCount) {
      const line = document.lineAt(currentLineNumber).text;
      nbrOfOpenedBrackets += (line.match(/{/g) || []).length;
      nbrOfClosedBrackets += (line.match(/}/g) || []).length;
      currentLineNumber++;
      if (nbrOfOpenedBrackets === nbrOfClosedBrackets) {
        break;
      }
    }
    return nbrOfClosedBrackets === nbrOfOpenedBrackets
      ? currentLineNumber
      : selectionLine + 1;
  }
  private functionAssignmentLine(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
  ): number {
    const currentLineText = document.lineAt(selectionLine).text;
    if (/{/.test(currentLineText)) {
      if (
        document
          .lineAt(selectionLine)
          .text.split('=')[1]
          .includes(selectedVariable)
      ) {
        return selectionLine + 1;
      }
      return (
        this.closingElementLine(
          document,
          selectionLine,
          BracketType.CURLY_BRACES,
        ) + 1
      );
    } else {
      const closedParenthesisLine = this.closingElementLine(
        document,
        selectionLine,
        BracketType.PARENTHESIS,
      );
      return (
        this.closingElementLine(
          document,
          closedParenthesisLine,
          BracketType.CURLY_BRACES,
        ) + 1
      );
    }
  }
  /**
   * Log line of a variable in multiline context (function parameter, or deconstructed object, etc.)
   */
  private functionClosedLine(
    document: TextDocument,
    declarationLine: number,
    bracketType: BracketType,
  ): number {
    let nbrOfOpenedBraces = 0;
    let nbrOfClosedBraces = 0;
    while (declarationLine < document.lineCount) {
      const { openedElementOccurrences, closedElementOccurrences } =
        this.locOpenedClosedElementOccurrences(
          document.lineAt(declarationLine).text,
          bracketType,
        );
      nbrOfOpenedBraces += openedElementOccurrences;
      nbrOfClosedBraces += closedElementOccurrences;
      if (nbrOfOpenedBraces - nbrOfClosedBraces === 0) {
        return declarationLine;
      }
      declarationLine++;
    }
    return -1;
  }
  private objectFunctionCallLine(
    document: TextDocument,
    selectionLine: number,
    selectedVariable: string,
  ): number {
    let currentLineText: string = document.lineAt(selectionLine).text;
    let nextLineText: string = document
      .lineAt(selectionLine + 1)
      .text.replaceAll(/\s/g, '');
    if (
      /\((\s*)$/.test(currentLineText.split(selectedVariable)[0]) ||
      /,(\s*)$/.test(currentLineText.split(selectedVariable)[0])
    ) {
      return selectionLine + 1;
    }
    let totalOpenedParenthesis = 0;
    let totalClosedParenthesis = 0;
    const occurrences = this.locOpenedClosedElementOccurrences(
      currentLineText,
      BracketType.PARENTHESIS,
    );
    totalOpenedParenthesis += occurrences.openedElementOccurrences;
    totalClosedParenthesis += occurrences.closedElementOccurrences;
    let currentLineNumber = selectionLine + 1;
    if (
      totalOpenedParenthesis !== totalClosedParenthesis ||
      currentLineText.endsWith('.') ||
      nextLineText.trim().startsWith('.')
    ) {
      while (currentLineNumber < document.lineCount) {
        currentLineText = document.lineAt(currentLineNumber).text;
        const lineOccurrences = this.locOpenedClosedElementOccurrences(
          currentLineText,
          BracketType.PARENTHESIS,
        );
        totalOpenedParenthesis += lineOccurrences.openedElementOccurrences;
        totalClosedParenthesis += lineOccurrences.closedElementOccurrences;
        if (currentLineNumber === document.lineCount - 1) {
          break;
        }
        nextLineText = document.lineAt(currentLineNumber + 1).text;
        currentLineNumber++;
        if (
          totalOpenedParenthesis === totalClosedParenthesis &&
          !currentLineText.endsWith('.') &&
          !nextLineText.trim().startsWith('.')
        ) {
          break;
        }
      }
    }
    return totalOpenedParenthesis === totalClosedParenthesis
      ? currentLineNumber
      : selectionLine + 1;
  }
  private arrayLine(document: TextDocument, selectionLine: number): number {
    const currentLineText: string = document.lineAt(selectionLine).text;
    let nbrOfOpenedBrackets: number = (currentLineText.match(/\[/g) || [])
      .length;
    let nbrOfClosedBrackets: number = (currentLineText.match(/]/g) || [])
      .length;
    let currentLineNumber: number = selectionLine + 1;
    if (nbrOfOpenedBrackets !== nbrOfClosedBrackets) {
      while (currentLineNumber < document.lineCount) {
        const line = document.lineAt(currentLineNumber).text;
        nbrOfOpenedBrackets += (line.match(/\[/g) || []).length;
        nbrOfClosedBrackets += (line.match(/]/g) || []).length;
        currentLineNumber++;
        if (nbrOfOpenedBrackets === nbrOfClosedBrackets) {
          break;
        }
      }
    }
    return nbrOfOpenedBrackets === nbrOfClosedBrackets
      ? currentLineNumber
      : selectionLine + 1;
  }
  private templateStringLine(
    document: TextDocument,
    selectionLine: number,
  ): number {
    const currentLineText: string = document.lineAt(selectionLine).text;
    let currentLineNumber: number = selectionLine + 1;
    let nbrOfBackticks: number = (currentLineText.match(/`/g) || []).length;
    while (currentLineNumber < document.lineCount) {
      const line = document.lineAt(currentLineNumber).text;
      nbrOfBackticks += (line.match(/`/g) || []).length;
      if (nbrOfBackticks % 2 === 0) {
        break;
      }
      currentLineNumber++;
    }
    return nbrOfBackticks % 2 === 0 ? currentLineNumber + 1 : selectionLine + 1;
  }
  locOpenedClosedElementOccurrences(
    loc: string,
    bracketType: BracketType,
  ): { openedElementOccurrences: number; closedElementOccurrences: number } {
    let openedElementOccurrences = 0;
    let closedElementOccurrences = 0;
    const openedElement: RegExp =
      bracketType === BracketType.PARENTHESIS ? /\(/g : /{/g;
    const closedElement: RegExp =
      bracketType === BracketType.PARENTHESIS ? /\)/g : /}/g;
    while (openedElement.test(loc)) {
      openedElementOccurrences++;
    }
    while (closedElement.test(loc)) {
      closedElementOccurrences++;
    }
    return {
      openedElementOccurrences,
      closedElementOccurrences,
    };
  }
  closingElementLine(
    document: TextDocument,
    lineNumber: number,
    bracketType: BracketType,
  ): number {
    const documentNbrOfLines: number = document.lineCount;
    let closingElementFound = false;
    let openedElementOccurrences = 0;
    let closedElementOccurrences = 0;
    while (!closingElementFound && lineNumber < documentNbrOfLines - 1) {
      const currentLineText: string = document.lineAt(lineNumber).text;
      const openedClosedElementOccurrences =
        this.locOpenedClosedElementOccurrences(currentLineText, bracketType);
      openedElementOccurrences +=
        openedClosedElementOccurrences.openedElementOccurrences;
      closedElementOccurrences +=
        openedClosedElementOccurrences.closedElementOccurrences;
      if (openedElementOccurrences === closedElementOccurrences) {
        closingElementFound = true;
        return lineNumber;
      }
      lineNumber++;
    }
    return lineNumber;
  }
}
