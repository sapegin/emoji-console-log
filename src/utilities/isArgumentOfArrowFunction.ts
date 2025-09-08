import { isArrowFunction } from './isArrowFunction';
import { removeStringContent } from './removeStringContent';

/**
 * Detects whether a given variable is an arrow function parameter.
 *
 * Examples:
 * - const y = foo.forEach((x) => foo(x)) - y: false, x: true
 */
export function isArgumentOfArrowFunction(
  line: string,
  argument: string,
): boolean {
  if (isArrowFunction(line)) {
    const cleanedLine = removeStringContent(line);
    const match = cleanedLine.match(/(\(.*\)|\w+)\s*=>/);
    return match !== null && match[1].includes(argument);
  }
  return false;
}
