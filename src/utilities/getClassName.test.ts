import { expect, test } from 'vitest';
import { getClassName } from './getClassName';

test('extracts the class name', () => {
  const classLOCs = [
    `export class Taco implements Food {`,
    `class MyComponent extends React.Component {`,
    `class HelloWorld{`,
    `class Day { `,
  ];
  const classesNames = ['Taco', 'MyComponent', 'HelloWorld', 'Day'];
  for (const [index, classLOC] of classLOCs.entries()) {
    expect(getClassName(classLOC)).to.equal(classesNames[index]);
  }
});
