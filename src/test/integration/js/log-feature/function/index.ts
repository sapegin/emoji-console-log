import { describe } from 'mocha';

import anonymousFunctionsTest from './anonymousFunctions';
import emptyFunctionTest from './emptyFunctions';
import functionAssignedToVariableTest from './functionAssignedToVariable';
import functionMultiLineParametersTest from './functionMultiLineParameters';
import functionParameterTest from './functionParameters';
import functionWithDecoratorsTest from './functionWithDecorators';
import oneLineFunctionParameterTest from './oneLineFunctionParameters';
import promiseAnonymousFunctionTest from './promiseAnonymousFunction';
export default (): void => {
  describe('Function Context', () => {
    anonymousFunctionsTest();
    emptyFunctionTest();
    functionAssignedToVariableTest();
    functionMultiLineParametersTest();
    functionParameterTest();
    functionWithDecoratorsTest();
    oneLineFunctionParameterTest();
    promiseAnonymousFunctionTest();
  });
};
