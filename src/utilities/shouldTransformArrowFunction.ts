import { isArrowFunction } from './isArrowFunction';

export function shouldTransformArrowFunction(loc: string): boolean {
  if (isArrowFunction(loc)) {
    if (/.*=>\s+{/.test(loc)) {
      return false;
    }
    return true;
  }
  return false;
}
