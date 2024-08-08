import { isAnonymousFunction } from './isAnonymousFunction';

export function shouldTransformAnonymousFunction(loc: string): boolean {
  if (isAnonymousFunction(loc)) {
    if (/.*=>\s+{/.test(loc)) {
      return false;
    }
    return true;
  }
  return false;
}
