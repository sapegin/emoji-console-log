import { describe, expect, test } from 'vitest';
import { LineCodeProcessing } from '.';

describe('assignment of an array to a variable', () => {
  test('returns true for array assignment LOCs', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
      expect(
        lineCodeProcessing.isArrayAssignedToVariable(arrayAssignmentLOC),
      ).to.equal(true);
    }
  });

  test('returns false for non-array assignment LOCs', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
      expect(
        lineCodeProcessing.isArrayAssignedToVariable(nonArrayAssignmentLOC),
      ).to.equal(false);
    }
  });
});

describe('check class declaration', () => {
  test('returns true for class declaration LOCs', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const classLOCs = [
      `export class LineCodeProcessing implements LineCodeProcessing {`,
      `class  HelloWorld extends React.Component {`,
      `class HelloWorld{`,
      `class HelloWorld { `,
    ];
    for (const classLOC of classLOCs) {
      expect(lineCodeProcessing.doesContainClassDeclaration(classLOC)).to.equal(
        true,
      );
    }
  });

  test('returns false for non-class declaration LOCs', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
      expect(
        lineCodeProcessing.doesContainClassDeclaration(nonClassLOC),
      ).to.equal(false);
    }
  });
});

describe('extract the class name', () => {
  test('extracts the class name', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const classLOCs = [
      `export class LineCodeProcessing implements LineCodeProcessing {`,
      `class  MyComponent extends React.Component {`,
      `class HelloWorld{`,
      `class Day { `,
    ];
    const classesNames = [
      'LineCodeProcessing',
      'MyComponent',
      'HelloWorld',
      'Day',
    ];
    for (const [index, classLOC] of classLOCs.entries()) {
      expect(lineCodeProcessing.getClassName(classLOC)).to.equal(
        classesNames[index],
      );
    }
  });
});

describe('anonymous function', () => {
  test('returns true if the LOC is an anonymous function', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const anonymousFunctionsLOCs = [
      'const sayHello = fullName => `Hello ${fullName}`',
      'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
      'fullName => `Hello ${fullName}`',
    ];
    for (const anonymousFunctionLOC of anonymousFunctionsLOCs) {
      expect(
        lineCodeProcessing.isAnonymousFunction(anonymousFunctionLOC),
      ).to.equal(true);
    }
  });

  test('returns true if the indicated parameter is an argument of the anonymous function', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const anonymousFunctionsArguments = [
      {
        loc: 'const sayHello = fullName => `Hello ${fullName}`',
        arg: 'fullName',
      },
      {
        loc: 'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
        arg: 'fullName',
      },
      {
        loc: 'fullName => `Hello ${fullName}`',
        arg: 'fullName',
      },
      {
        loc: 'const user = users.find(item => item.email === email)',
        arg: 'item',
      },
    ];
    for (const { loc, arg } of anonymousFunctionsArguments) {
      expect(
        lineCodeProcessing.isArgumentOfAnonymousFunction(loc, arg),
      ).to.equal(true);
    }
  });

  test('returns false if the indicated parameter is not an argument of the anonymous function', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    expect(
      lineCodeProcessing.isArgumentOfAnonymousFunction(
        'function functionName(parameter){',
        'parameter',
      ),
    ).to.equal(false);
    expect(
      lineCodeProcessing.isArgumentOfAnonymousFunction(
        'const user = users.find(item => item.email === email)',
        'user',
      ),
    ).to.equal(false);
  });

  test('returns true if anonymous function needs to be transformed', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const anonymousFunctionsLOCs = [
      'const sayHello = fullName => `Hello ${fullName}`',
      'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
      'fullName => `Hello ${fullName}`',
    ];
    for (const anonymousFunctionLOC of anonymousFunctionsLOCs) {
      expect(
        lineCodeProcessing.shouldTransformAnonymousFunction(
          anonymousFunctionLOC,
        ),
      ).to.equal(true);
    }
  });

  test('returns false if anonymous function is already transformed', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const transformedAnonymousFunctions = [
      'const sayHello = fullName => { `Hello ${fullName}`',
    ];
    for (const transformedAnonymousFunction of transformedAnonymousFunctions) {
      expect(
        lineCodeProcessing.shouldTransformAnonymousFunction(
          transformedAnonymousFunction,
        ),
      ).to.equal(false);
    }
  });
});

describe('assignment of a function to a variable', () => {
  test('returns true if the LOC is an assignment of a function to a variable', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
      expect(
        lineCodeProcessing.isFunctionAssignedToVariable(
          functionsAssignmentsLOC,
        ),
      ).to.equal(true);
    }
  });
});

describe('built-in function LOC', () => {
  test('returns true when loc contains a built-in function', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const builtInFunctionInvocationLOCs = [
      `if (a > 0)  {`,
      `if (a > 0) return 0;`,
      `switch (n) {`,
      `for(let i=0; i < 10; i++) {`,
      `while(true) {`,
      `catch(error) {`,
      `do {

                      } while(true)`,
      `while( n < 3) {
                          n++;
                      }`,
    ];
    for (const builtInFunctionInvocationLOC of builtInFunctionInvocationLOCs) {
      expect(
        lineCodeProcessing.doesContainsBuiltInFunction(
          builtInFunctionInvocationLOC,
        ),
      ).to.equal(true);
    }
  });

  test('returns false when loc does not contain a built-in function', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const nonBuiltInFunctionLOCs = [`function sayHello() {`];
    for (const nonBuiltInFunctionLOC of nonBuiltInFunctionLOCs) {
      expect(
        lineCodeProcessing.doesContainsBuiltInFunction(nonBuiltInFunctionLOC),
      ).to.equal(false);
    }
  });
});

describe('extract function name from LOC', () => {
  test('extracts the function name from the LOC', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const namedFunctionsLOCs = [
      {
        loc: 'function functionName(){',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'function sayHello (arg1, arg2) {',
        expectedFunctionName: 'sayHello',
      },
      {
        loc: 'module.exports = function functionName (arg1, arg2) {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'export default function functionName (arg1, arg2) {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'function functionName (arg1, arg2, arg3) {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'let functionName = (arg1, arg2) => {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'array.forEach(function functionName() {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'export const functionName = (arg1, arg2) => {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'const functionName = (arg1: Type1, arg2: Type2) => {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'const functionName = (arg1: Type1, arg2: Type2): Type3 => {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'async functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'public functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'public async functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'public static functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'private functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'protected functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'static functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'export functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'export async functionName(arg1: any): any {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'export default async function functionName(arg1) {',
        expectedFunctionName: 'functionName',
      },
      {
        loc: 'constructor(fullName) {',
        expectedFunctionName: 'constructor',
      },
      {
        loc: 'async sayHello(somePram: any): Promise<void> {',
        expectedFunctionName: 'sayHello',
      },
      {
        loc: 'public unitsValidation(scriptId): any[] {',
        expectedFunctionName: 'unitsValidation',
      },
    ];
    for (const { loc, expectedFunctionName } of namedFunctionsLOCs) {
      expect(lineCodeProcessing.getFunctionName(loc)).to.equal(
        expectedFunctionName,
      );
    }
  });
});

describe('named function LOC', () => {
  const namedFunctionsLOCs = [
    'function functionName(){',
    'function functionName(){',
    'function sayHello (arg1, arg2) {',
    'module.exports = function functionName (arg1, arg2) {',
    'export default function functionName (arg1, arg2) {',
    'functionName (arg1, arg2, arg3) {',
    'const functionName = function (arg1, arg2) {',
    'let functionName = (arg1, arg2) => {',
    'array.forEach(function functionName() {',
    'export const functionName = (arg1, arg2) => {',
    'const functionName = (arg1: Type1, arg2: Type2) => {',
    'const functionName = (arg1: Type1, arg2: Type2): Type3 => {',
    'functionName(arg1: any): any {',
    'async functionName(arg1: any): any {',
    'public functionName(arg1: any): any {',
    'public async functionName(arg1: any): any {',
    'public static functionName(arg1: any): any {',
    'private functionName(arg1: any): any {',
    'protected functionName(arg1: any): any {',
    'static functionName(arg1: any): any {',
    'export functionName(arg1: any): any {',
    'export default async function functionName(arg1) {',
    '  constructor(fullName) {',
    ' async sayHello(somePram: any): Promise<void> {',
    '  unitsValidation( scriptId ): any[] {',
  ];

  test('returns true when LOC contains named function declaration', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    for (const namedFunctionLOC of namedFunctionsLOCs) {
      expect(
        lineCodeProcessing.doesContainsNamedFunctionDeclaration(
          namedFunctionLOC,
        ),
      ).to.equal(true);
    }
  });

  test('return false LOC doesn’t contains named function declaration', () => {
    const lineCodeProcessing = new LineCodeProcessing();
    const nonNamedFunctionsLOCs = [
      'function() {',
      'function(arg1, arg2) {',
      '() => {',
      '(arg1, arg2) => {',
      'module.exports = function (arg1, arg2) {',
      'function( {',
      'function) {',
    ];
    for (const nonNamedFunctionLOC of nonNamedFunctionsLOCs) {
      expect(
        lineCodeProcessing.doesContainsNamedFunctionDeclaration(
          nonNamedFunctionLOC,
        ),
      ).to.equal(false);
    }
  });
});

describe('object function call', () => {
  test('returns true if the LOC is an object function call', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
      expect(
        lineCodeProcessing.isObjectFunctionCall(objectFunctionCallLOC),
      ).to.equal(true);
    }
  });

  test('returns false if the LOC is not an object function call', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
      expect(
        lineCodeProcessing.isObjectFunctionCall(functionsAssignmentsLOC),
      ).to.equal(false);
    }
  });
});

describe('assignment of object literal to a variable', () => {
  test('returns true for object literal assignment LOCs', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
        lineCodeProcessing.isObjectLiteralAssignedToVariable(
          objectLiteralAssignmentLOC,
        ),
      ).to.equal(true);
    }
  });

  test('returns false for non-object literal assignment LOCs', () => {
    const lineCodeProcessing = new LineCodeProcessing();
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
        lineCodeProcessing.isObjectLiteralAssignedToVariable(
          nonObjectLiteralAssignmentLOC,
        ),
      ).to.equal(false);
    }
  });
});
