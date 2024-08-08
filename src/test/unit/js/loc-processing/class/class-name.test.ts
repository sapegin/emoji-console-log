import { describe, it } from 'mocha';
import { expect } from 'chai';
import helpers from '../../helpers';

export default (): void => {
  describe('Extract the class name', () => {
    it('Should extract the class name', () => {
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
        expect(helpers.jsLineCodeProcessing.getClassName(classLOC)).to.equal(
          classesNames[index],
        );
      }
    });
  });
};
