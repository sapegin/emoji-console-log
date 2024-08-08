/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-require-imports */

import path from 'node:path';
import { readFileSync } from 'node:fs';
import memoize from 'lodash/memoize';
import { findUp } from 'find-up';
import { TextEditorOptions } from 'vscode';
import { logDebugMessage } from './debug';

// We can't use Prettier directly since extensions don't allow dynamic imports:
// https://github.com/prettier/prettier-vscode/pull/3016
// Instead we find and read Prettier config file manually.
// We only support JSON and JavaScript configs
// https://prettier.io/docs/en/configuration

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
    const config = require(filepath);

    logDebugMessage(`Prettier config:`);
    logDebugMessage(JSON.stringify(config));

    return config;
  } catch (error) {
    logDebugMessage(`Cannot read Prettier config from ${filepath}:`);
    if (error instanceof Error) {
      logDebugMessage(error.message);
    }
    return {};
  }
}

async function readPrettierConfigJson(filepath: string) {
  try {
    const config = JSON.parse(readFileSync(filepath, 'utf8'));

    logDebugMessage(`Prettier config:`);
    logDebugMessage(JSON.stringify(config));

    return config;
  } catch (error) {
    logDebugMessage(`Cannot read Prettier config from ${filepath}:`);
    if (error instanceof Error) {
      logDebugMessage(error.message);
    }
    return {};
  }
}

async function readPrettierConfigPackage(filepath: string) {
  try {
    const packageJson = JSON.parse(readFileSync(filepath, 'utf8'));

    if (packageJson.prettier) {
      logDebugMessage(`Prettier config:`);
      logDebugMessage(JSON.stringify(packageJson.prettier));

      return packageJson.prettier;
    } else {
      return {};
    }
  } catch (error) {
    logDebugMessage(`Cannot read Prettier config from ${filepath}:`);
    if (error instanceof Error) {
      logDebugMessage(error.message);
    }
    return {};
  }
}

async function getPrettierConfig(filepath: string) {
  const filename = path.basename(filepath);
  switch (filename) {
    // JSON
    case '.prettierrc':
    case '.prettierrc.json': {
      return readPrettierConfigJson(filepath);
    }

    // JavaScript
    default: {
      return readPrettierConfigJavaScript(filepath);
    }
  }
}

async function resolvePrettierConfig(filepath: string) {
  const cwd = path.dirname(filepath);

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
    logDebugMessage(`Prettier config file for ${filepath}:`);
    logDebugMessage(`${configFile}`);

    // Try to read config file
    return getPrettierConfig(configFile);
  }

  // Try to read configuration from package.json if no config file present
  const packageFile = await findUp('package.json', {
    cwd,
  });

  if (packageFile) {
    logDebugMessage(`Package.json for ${filepath}:`);
    logDebugMessage(`${packageFile}`);

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

  logDebugMessage(`Detected code style for ${filepath}:`);
  logDebugMessage(JSON.stringify(style));

  return style;
}

export const getFileCodeStyle = memoize(getFileCodeStyleRaw);
