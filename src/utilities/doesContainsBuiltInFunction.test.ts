import { expect, test } from 'vitest';
import { doesContainsBuiltInFunction } from './doesContainsBuiltInFunction';

test('returns true when loc contains a built-in function', () => {
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
    expect(doesContainsBuiltInFunction(builtInFunctionInvocationLOC)).to.equal(
      true,
    );
  }
});

test('returns false when loc does not contain a built-in function', () => {
  const nonBuiltInFunctionLOCs = [`function sayHello() {`];
  for (const nonBuiltInFunctionLOC of nonBuiltInFunctionLOCs) {
    expect(doesContainsBuiltInFunction(nonBuiltInFunctionLOC)).to.equal(false);
  }
});
