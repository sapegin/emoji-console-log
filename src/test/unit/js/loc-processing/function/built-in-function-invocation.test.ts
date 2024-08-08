import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Built-in function LOC', () => {
    it('Should return true when loc contains a built-in function', () => {
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
          helpers.jsLineCodeProcessing.doesContainsBuiltInFunction(
            builtInFunctionInvocationLOC,
          ),
        ).to.equal(true);
      }
    });
    it('Should return false when loc does not contain a built-in function', () => {
      const nonBuiltInFunctionLOCs = [`function sayHello() {`];
      for (const nonBuiltInFunctionLOC of nonBuiltInFunctionLOCs) {
        expect(
          helpers.jsLineCodeProcessing.doesContainsBuiltInFunction(
            nonBuiltInFunctionLOC,
          ),
        ).to.equal(false);
      }
    });
  });
};
