import { expect, test } from 'vitest';
import { isObjectLiteralAssignedToVariable } from './isObjectLiteralAssignedToVariable';

test('returns true for object literal assignment LOCs', () => {
  const objectLiteralAssignmentLOCs = [
    `var myObject = {
                        sProp: 'some string value',
                        numProp: 2,
                        bProp: false
                    };`,
    `var myObject = { sProp: 'some string value', numProp: 2, bProp: false};`,
    `var Swapper = {
                        images: ["smile.gif", "grim.gif", "frown.gif", "bomb.gif"],
                        pos: { // nested object literal
                            x: 40,
                            y: 300
                        },
                        onSwap: function() { // function
                            // code here
                        }
                    };`,
    `var car = {type:"Fiat", model:"500", color:"white"};`,
    `let person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};`,
    `const person = {
                        firstName: "John",
                        lastName: "Doe",
                        age: 50,
                        eyeColor: "blue"
                      };`,
    `const variable: FilterObject<UrlRuleEntity> = {
                a: SomeOperator.someFunc(NOW, { orNull: true }),
                ...(undefined !== b && { b }),
                ...(undefined !== c && { c }),
                ...(undefined !== d && { d }),
                ...(Boolean(started) && {
                  x: SomeOperator.y(p),
                }),
              };`,
    'export const platform={clear(){',
    'let obj = {x, y, z};',
  ];
  for (const objectLiteralAssignmentLOC of objectLiteralAssignmentLOCs) {
    expect(
      isObjectLiteralAssignedToVariable(objectLiteralAssignmentLOC),
    ).to.equal(true);
  }
});

test('returns false for non-object literal assignment LOCs', () => {
  const nonObjectLiteralAssignmentLOCs = [
    `var myVar = 1;`,
    `var myVar = false`,
    `var myVar = [1, 'hello', false];`,
    `var myVar = [1, 'hello', false];`,
    `let someVar = function sayHello() {
                        return true;
                    }`,
    `sayHello(someObj: { someProp: string }): number {`,
  ];

  for (const nonObjectLiteralAssignmentLOC of nonObjectLiteralAssignmentLOCs) {
    expect(
      isObjectLiteralAssignedToVariable(nonObjectLiteralAssignmentLOC),
    ).to.equal(false);
  }
});
