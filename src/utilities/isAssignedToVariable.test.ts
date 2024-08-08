import { expect, test } from 'vitest';
import { isAssignedToVariable } from './isAssignedToVariable';

test('returns true if the LOC is an assignment to a variable', () => {
  const variableAssignmentsLOCs = [`const num = 42;`, `const str = 'tacocat'`];
  for (const functionsAssignmentsLOC of variableAssignmentsLOCs) {
    expect(isAssignedToVariable(functionsAssignmentsLOC)).to.equal(true);
  }
});
