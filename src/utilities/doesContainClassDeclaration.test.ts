import { expect, test } from 'vitest';
import { doesContainClassDeclaration } from './doesContainClassDeclaration';

test('returns true for class declaration LOCs', () => {
  const classLOCs = [
    `export class Taco implements Food {`,
    `class  HelloWorld extends React.Component {`,
    `class HelloWorld{`,
    `class HelloWorld { `,
  ];
  for (const classLOC of classLOCs) {
    expect(doesContainClassDeclaration(classLOC)).to.equal(true);
  }
});

test('returns false for non-class declaration LOCs', () => {
  const nonClassLOCs = [
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
                      };`,
    `function classicMoves() {`,
  ];
  for (const nonClassLOC of nonClassLOCs) {
    expect(doesContainClassDeclaration(nonClassLOC)).to.equal(false);
  }
});
