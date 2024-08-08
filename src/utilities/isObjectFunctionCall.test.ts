import { expect, test } from 'vitest';
import { isObjectFunctionCall } from './isObjectFunctionCall';

test('returns true if the LOC is an object function call', () => {
  const objectFunctionCallLOCs = [
    `const x = obj.someFunc();`,
    `const x = obj.someFunc()`,
    `const myVar = obj.someFunc(1, true, false);`,
    `const myVar = obj.
                someFunc(
                  1,
                  true,
                  false
                );
              `,
    `const myVar = obj
                .someFunc(
                  1,
                  true,
                  false
                );
              `,
    `const subscription = this.userService.currentUser.subscribe(`,
    `this.subscription = this.userService.currentUser.subscribe(`,
    `this.subscription.add(`,
  ];
  for (const objectFunctionCallLOC of objectFunctionCallLOCs) {
    expect(isObjectFunctionCall(objectFunctionCallLOC)).to.equal(true);
  }
});

test('returns false if the LOC is not an object function call', () => {
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
  ];
  for (const functionsAssignmentsLOC of functionsAssignmentsLOCs) {
    expect(isObjectFunctionCall(functionsAssignmentsLOC)).to.equal(false);
  }
});
