import { basename, dirname } from 'path';
import { readFileSync } from 'fs';
import _ from 'lodash';
import { findUp } from 'find-up';
import { TextEditorOptions, window } from 'vscode';

// We can't use Prettier directly since extensions don't allow dynamic imports:
// https://github.com/prettier/prettier-vscode/pull/3016
// Instead we find and read Prettier config file manually.
// We only support JSON and JavaScript configs
// https://prettier.io/docs/en/configuration

const debug = window.createOutputChannel('Emoji Console Log');

export interface CodeStyle {
  tab: string;
  quote: '"' | "'";
  semicolon: ';' | '';
}

const defaultTabWidth = 2;
const defaultSemicolon = true;
const defaultSingleQuote = false;

async function readPrettierConfigJavaScript(filepath: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(filepath);

    debug.appendLine(`Prettier config:`);
    debug.appendLine(JSON.stringify(config));

    return config;
  } catch (err) {
    debug.appendLine(`Cannot read Prettier config from ${filepath}:`);
    if (err instanceof Error) {
      debug.appendLine(err.message);
    }
    return {};
  }
}

async function readPrettierConfigJson(filepath: string) {
  try {
    const config = JSON.parse(readFileSync(filepath, 'utf8'));

    debug.appendLine(`Prettier config:`);
    debug.appendLine(JSON.stringify(config));

    return config;
  } catch (err) {
    debug.appendLine(`Cannot read Prettier config from ${filepath}:`);
    if (err instanceof Error) {
      debug.appendLine(err.message);
    }
    return {};
  }
}

async function readPrettierConfigPackage(filepath: string) {
  try {
    const packageJson = JSON.parse(readFileSync(filepath, 'utf8'));

    if (packageJson.prettier) {
      debug.appendLine(`Prettier config:`);
      debug.appendLine(JSON.stringify(packageJson.prettier));

      return packageJson.prettier;
    } else {
      return {};
    }
  } catch (err) {
    debug.appendLine(`Cannot read Prettier config from ${filepath}:`);
    if (err instanceof Error) {
      debug.appendLine(err.message);
    }
    return {};
  }
}

async function getPrettierConfig(filepath: string) {
  const filename = basename(filepath);
  switch (filename) {
    // JSON
    case '.prettierrc':
    case '.prettierrc.json':
      return readPrettierConfigJson(filepath);

    // JavaScript
    default:
      return readPrettierConfigJavaScript(filepath);
  }
}

async function resolvePrettierConfig(filepath: string) {
  const cwd = dirname(filepath);

  // Try to find Prettier config
  const configFile = await findUp(
    [
      '.prettierrc',
      '.prettierrc.json',
      '.prettierrc.js',
      'prettier.config.js',
      '.prettierrc.mjs',
      'prettier.config.mjs',
      '.prettierrc.cjs',
      'prettier.config.cjs',
    ],
    {
      cwd,
    },
  );

  if (configFile) {
    debug.appendLine(`Prettier config file for ${filepath}:`);
    debug.appendLine(`${configFile}`);

    // Try to read config file
    return getPrettierConfig(configFile);
  }

  // Try to read configuration from package.json if no config file present
  const packageFile = await findUp('package.json', {
    cwd,
  });

  if (packageFile) {
    debug.appendLine(`Package.json for ${filepath}:`);
    debug.appendLine(`${packageFile}`);

    return readPrettierConfigPackage(packageFile);
  }
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
  const fileConfig = await resolvePrettierConfig(filepath);
  const useSingleQuote = fileConfig?.singleQuote ?? defaultSingleQuote;
  const useSemicolon = fileConfig?.semi ?? defaultSemicolon;

  const style: CodeStyle = {
    tab: getTab(editorOptions),
    quote: useSingleQuote ? "'" : '"',
    semicolon: useSemicolon ? ';' : '',
  };

  debug.appendLine(`Detected code style for ${filepath}:`);
  debug.appendLine(JSON.stringify(style));

  return style;
}

export const getFileCodeStyle = _.memoize(getFileCodeStyleRaw);
