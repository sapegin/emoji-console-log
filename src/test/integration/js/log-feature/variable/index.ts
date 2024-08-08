import { describe } from 'mocha';
import deconstructionVariableAssignmentTest from './deconstructionVariableAssignment';
import deconstructionArgumentFunction from './deconstructionArgumentFunction';
import primitiveVariableTest from './primitiveVariable';
import logLastLineTest from './logLastLine';

export default (): void => {
  describe('Variable context menu', () => {
    deconstructionVariableAssignmentTest();
    primitiveVariableTest();
    logLastLineTest();
    deconstructionArgumentFunction();
  });
};
