import { expect, test } from 'vitest';
import { isArrayAssignedToVariable } from './isArrayAssignedToVariable';

test('returns true for array assignment LOCs', () => {
  const arrayAssignmentLOCs = [
    `let    myArray =   [
                        1,
                        2,
                        3
                    ];`,
    `var someArray = ['one', true, {someProp: false}];`,
    `const someArray =  [function sayHello()   {
                        return true;
                    }, true, false, 'hie'];`,
    `export const SLIDE_LEFT_ANIMATION = [`,
  ];
  for (const arrayAssignmentLOC of arrayAssignmentLOCs) {
    expect(isArrayAssignedToVariable(arrayAssignmentLOC)).to.equal(true);
  }
});

test('returns false for non-array assignment LOCs', () => {
  const nonArrayAssignmentLOCs = [
    `var myVar = 1;`,
    `var myVar = false`,
    `let someVar = function sayHello() {
                        return true;
                    }`,
    `let person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};`,
    `const person = {
                        firstName: "John",
                        lastName: "Doe",
                        age: 50,
                        eyeColor: "blue"
                    };
                    `,
    `someFunc(someArray: Array<number> = [1, 2, 3]) {}`,
  ];
  for (const nonArrayAssignmentLOC of nonArrayAssignmentLOCs) {
    expect(isArrayAssignedToVariable(nonArrayAssignmentLOC)).to.equal(false);
  }
});
