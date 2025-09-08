import { expect, test } from 'vitest';
import { removeStringContent } from './removeStringContent';

test.each([
  // Single quotes
  ["const x = 'hello world'", "const x = ''"],
  [String.raw`const x = 'hello \'world\''`, "const x = ''"],
  [String.raw`const x = 'hello "world"'`, "const x = ''"],
  ["const x = 'foo' + 'bar'", "const x = '' + ''"],

  // Double quotes
  ['const x = "hello world"', 'const x = ""'],
  [String.raw`const x = "hello \"world\""`, 'const x = ""'],
  [String.raw`const x = "hello 'world'"`, 'const x = ""'],
  ['const x = "foo" + "bar"', 'const x = "" + ""'],

  // Template literals
  ['const x = `hello world`', 'const x = ``'],
  ['const x = `hello \\`world\\``', 'const x = ``'],
  ['const x = `hello ${name}`', 'const x = ``'],

  // Mixed quotes
  ['const x = "foo" + `bar` + \'baz\'', 'const x = "" + `` + \'\''],

  // Code without strings
  ['const x = 42 + y', 'const x = 42 + y'],
  ['function test() { return true; }', 'function test() { return true; }'],

  // Complex cases
  ['const msg = `Hello ${name}, welcome to "our" site!`', 'const msg = ``'],
  [
    String.raw`const regex = /test\/pattern/g`,
    String.raw`const regex = /test\/pattern/g`,
  ],
])('removeStringContent("%s") should return "%s"', (input, expected) => {
  expect(removeStringContent(input)).toBe(expected);
});
