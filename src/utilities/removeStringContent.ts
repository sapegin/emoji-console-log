/**
 * Removes string content (anything between quotes) to avoid false positives.
 *
 * Examples:
 * - `const x = 'hello world'` → `const x = ''`
 */
export function removeStringContent(code: string): string {
  return code
    .replaceAll(/'(?:[^'\\]|\\.)*'/g, "''")
    .replaceAll(/"(?:[^"\\]|\\.)*"/g, '""')
    .replaceAll(/`(?:[^`\\]|\\.)*`/g, '``');
}
