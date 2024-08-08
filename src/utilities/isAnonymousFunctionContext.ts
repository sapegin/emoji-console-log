import { isAnonymousFunction } from './isAnonymousFunction';
import { isArgumentOfAnonymousFunction } from './isArgumentOfAnonymousFunction';
import { shouldTransformAnonymousFunction } from './shouldTransformAnonymousFunction';

export function isAnonymousFunctionContext(
  selectedVariable: string,
  selectedVariableLineLoc: string,
): boolean {
  return (
    isAnonymousFunction(selectedVariableLineLoc) &&
    isArgumentOfAnonymousFunction(selectedVariableLineLoc, selectedVariable) &&
    shouldTransformAnonymousFunction(selectedVariableLineLoc)
  );
}
