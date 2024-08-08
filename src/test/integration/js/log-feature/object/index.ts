import { describe } from 'mocha';
import logObjectPropertyTest from './logObjectProperty';
import objectVariableTest from './objectVariable';
import objectFunctionCall from './objectFunctionCall';
import objectFunctionCallNoAssignmentTest from './objectFunctionCallNoAssignment';
import objectWithTypeTest from './objectWithType';

export default (): void => {
  describe('Object context', () => {
    logObjectPropertyTest();
    objectVariableTest();
    objectFunctionCall();
    objectFunctionCallNoAssignmentTest();
    objectWithTypeTest();
  });
};
