import { expect, test } from 'vitest';
import { isFunctionAssignedToVariable } from './isFunctionAssignedToVariable';

test('returns true if the LOC is an assignment of a function to a variable', () => {
  const functionsAssignmentsLOCs = [
    `const x = someFunc();`,
    `const x = someFunc()`,
    `const myVar = someFunc(1, true, false);`,
    `const myVar = someFunc(
              1,
              true,
              false
            );`,
    `const x = function () {`,
    `const myVar = function sayHello(fullName) {
              return 'hello';
            }`,
    `const myVar =  (fullName) => {
              return 'hello';
            }`,
    'onDragStart={(start: DragStart, provided: ResponderProvided) => {',
  ];
  for (const functionsAssignmentsLOC of functionsAssignmentsLOCs) {
    expect(isFunctionAssignedToVariable(functionsAssignmentsLOC)).to.equal(
      true,
    );
  }
});
