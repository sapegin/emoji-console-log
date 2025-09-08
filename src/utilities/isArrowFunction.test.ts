import { expect, test } from 'vitest';
import { isArrowFunction } from './isArrowFunction';

test.each([
  'const sayHello = fullName => `Hello ${fullName}`',
  'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
  'fullName => `Hello ${fullName}`',
])('returns true if the LOC is an arrow function: %s', (arrowFunctionLOC) => {
  expect(isArrowFunction(arrowFunctionLOC)).to.equal(true);
});
