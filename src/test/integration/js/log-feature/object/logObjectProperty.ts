import Mocha, { it, describe } from 'mocha';
import { expect } from 'chai';
import * as vscode from 'vscode';
import {
  openDocument,
  NaturalEditorPosition,
  naturalEditorLine,
  expectActiveTextEditorWithFile,
  documentLinesChanged,
} from '../../../helpers';
import { ProgrammingLanguage } from '../../../../../types';

export default (): void => {
  describe('Object property', () => {
    Mocha.beforeEach(async () => {
      await openDocument(
        ProgrammingLanguage.JAVASCRIPT,
        'log-feature/object',
        'logObjectProperty.js',
      );
    });
    Mocha.afterEach(async () => {
      await vscode.commands.executeCommand(
        'workbench.action.closeActiveEditor',
        [],
      );
    });
    it('Should handles log message related to an object property (one level)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'logObjectProperty.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(3, 3),
            new NaturalEditorPosition(3, 6),
          ),
        ];
        await vscode.commands.executeCommand(
          'emojiConsoleLog.addLogMessage',
          [],
        );
        // Console log message is appended to the end of the document starting with /n character
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(10)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(logMessage).to.includes('person.age');
      }
    });
    it('Should handles log message related to an object property (two levels)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'logObjectProperty.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(5, 7),
            new NaturalEditorPosition(5, 13),
          ),
        ];
        await vscode.commands.executeCommand(
          'emojiConsoleLog.addLogMessage',
          [],
        );
        // Console log message is appended to the end of the document starting with /n character
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(10)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(logMessage).to.includes('person.family.mother');
      }
    });
    it('Should handles log message related to an object property (three levels)', async () => {
      const { activeTextEditor } = vscode.window;
      expectActiveTextEditorWithFile(activeTextEditor, 'logObjectProperty.js');
      if (activeTextEditor) {
        activeTextEditor.selections = [
          new vscode.Selection(
            new NaturalEditorPosition(6, 11),
            new NaturalEditorPosition(6, 19),
          ),
        ];
        await vscode.commands.executeCommand(
          'emojiConsoleLog.addLogMessage',
          [],
        );
        // Console log message is appended to the end of the document starting with /n character
        await Promise.all(
          documentLinesChanged(activeTextEditor.document, [
            naturalEditorLine(9),
          ]),
        );
        const textDocument = activeTextEditor.document;
        const logMessage = textDocument.lineAt(naturalEditorLine(10)).text;
        expect(/console\.log\(.*/.test(logMessage)).to.equal(true);
        expect(logMessage).to.includes('person.family.mother.firstName');
      }
    });
  });
};
