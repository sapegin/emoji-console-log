import { isAnonymousFunction } from './isAnonymousFunction';

export function isArgumentOfAnonymousFunction(
  loc: string,
  argument: string,
): boolean {
  if (isAnonymousFunction(loc)) {
    const match = loc.match(/(\(.*\)|\w+)\s*=>/);
    return match !== null && match[1].includes(argument);
  }
  return false;
}
