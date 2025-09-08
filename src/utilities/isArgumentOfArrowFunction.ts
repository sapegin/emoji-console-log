import { isArrowFunction } from './isArrowFunction';

/**
 * Detects whether a given variable is an arrow function parameter.
 *
 * Examples:
 * - const y = foo.forEach((x) => foo(x)) - y: false, x: true
 */
export function isArgumentOfArrowFunction(
  loc: string,
  argument: string,
): boolean {
  if (isArrowFunction(loc)) {
    const match = loc.match(/(\(.*\)|\w+)\s*=>/);
    return match !== null && match[1].includes(argument);
  }
  return false;
}
