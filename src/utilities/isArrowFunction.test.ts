import { expect, test } from 'vitest';
import { isArrowFunction } from './isArrowFunction';

test.each([
  // Positive cases (should return true)
  ['const sayHello = fullName => `Hello ${fullName}`', true],
  [
    'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
    true,
  ],
  ['fullName => `Hello ${fullName}`', true],

  // Negative cases (should return false)
  ['function sayHello(fullName) { return `Hello ${fullName}` }', false],
  ['const sayHello = function(fullName) { return `Hello ${fullName}` }', false],
  ['class MyClass {}', false],
  ['let x = 42;', false],
  ['if (true) {}', false],
  ['sayHello(fullName)', false],
])('isArrowFunction returns correct result for: %s', (loc, expected) => {
  expect(isArrowFunction(loc)).to.equal(expected);
});
