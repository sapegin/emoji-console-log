/* eslint-disable unicorn/prefer-module */

import * as vscode from 'vscode';
import path from 'node:path';

export const openDocument = async (
  programmingLanguage: string,
  scope = '',
  fileName: string,
): Promise<void> => {
  const uri = path.join(
    __dirname,
    '../../files',
    programmingLanguage,
    scope,
    fileName,
  );
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
};
