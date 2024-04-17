import _ from 'lodash';
import { getSupportInfo, Options, resolveConfig } from 'prettier';
import { TextEditorOptions, window } from 'vscode';

const debug = window.createOutputChannel('Emoji Console Log');

export interface CodeStyle {
  tab: string;
  quote: '"' | "'";
  semicolon: ';' | '';
}

const defaultTabWidth = 2;

async function getPrettierDefaultOption<T>(optionName: string) {
  const info = await getSupportInfo();
  return info.options.find(({ name }) => name === optionName)?.default as
    | T
    | undefined;
}

async function resolvePrettierOption<T>(
  optionName: string,
  fileConfig: Options | null,
) {
  if (fileConfig?.[optionName]) {
    return fileConfig?.[optionName] as T;
  }

  return getPrettierDefaultOption<T>(optionName);
}

function getTab(editorOptions: TextEditorOptions) {
  if (editorOptions.insertSpaces) {
    if (typeof editorOptions.tabSize === 'number') {
      return ' '.repeat(editorOptions.tabSize ?? defaultTabWidth);
    } else {
      return ' '.repeat(defaultTabWidth);
    }
  } else {
    return '\t';
  }
}

async function getFileCodeStyleRaw(
  filepath: string,
  editorOptions: TextEditorOptions,
): Promise<CodeStyle> {
  const fileConfig = await resolveConfig(filepath);
  const prettierSingleQuote = await resolvePrettierOption<boolean>(
    'singleQuote',
    fileConfig,
  );
  const prettierSemicolon = await resolvePrettierOption<boolean>(
    'semi',
    fileConfig,
  );

  const style: CodeStyle = {
    tab: getTab(editorOptions),
    quote: prettierSingleQuote ? "'" : '"',
    semicolon: prettierSemicolon ? ';' : '',
  };

  debug.appendLine(`Detected code style for ${filepath}:`);
  debug.appendLine(JSON.stringify(style));

  return style;
}

export const getFileCodeStyle = _.memoize(getFileCodeStyleRaw);
