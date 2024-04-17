import { getSupportInfo, Options, resolveConfig } from 'prettier';
import { TextEditorOptions } from 'vscode';

export interface CodeStyle {
  tab: string;
  quote: '"' | "'";
  semicolon: ';' | '';
}

// TODO: Memoize

const defaultTabWidth = 2;

async function getPrettierDefaultOption(optionName: string) {
  const info = await getSupportInfo();
  return info.options.find(({ name }) => name === optionName)?.default;
}

async function resolvePrettierOption(
  optionName: string,
  fileConfig: Options | null,
) {
  if (fileConfig?.[optionName]) {
    return fileConfig?.[optionName];
  }

  return getPrettierDefaultOption(optionName);
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

export async function getFileCodeStyle(
  filepath: string,
  editorOptions: TextEditorOptions,
): Promise<CodeStyle> {
  const fileConfig = await resolveConfig(filepath);
  const prettierSingleQuote = await resolvePrettierOption(
    'singleQuote',
    fileConfig,
  );
  const prettierSemicolon = await resolvePrettierOption('semi', fileConfig);

  return {
    tab: getTab(editorOptions),
    quote: prettierSingleQuote ? "'" : '"',
    semicolon: prettierSemicolon ? ';' : '',
  };
}
