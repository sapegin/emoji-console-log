import { expect, test } from 'vitest';
import { isArgumentOfArrowFunction } from './isArgumentOfArrowFunction';

test.each([
  // Should return true
  ['const sayHello = fullName => `Hello ${fullName}`', 'fullName', true],
  [
    'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
    'fullName',
    true,
  ],
  ['fullName => `Hello ${fullName}`', 'fullName', true],
  ['const user = users.find(item => item.email === email)', 'item', true],
  // Should return false
  ['function functionName(parameter){', 'parameter', false],
  ['const user = users.find(item => item.email === email)', 'user', false],
])(
  'isArgumentOfArrowFunction("%s", "%s") should return %s',
  (loc, arg, expected) => {
    expect(isArgumentOfArrowFunction(loc, arg)).to.equal(expected);
  },
);

test('returns false if the indicated parameter is not an argument of the arrow function', () => {
  expect(
    isArgumentOfArrowFunction('function functionName(parameter){', 'parameter'),
  ).to.equal(false);
  expect(
    isArgumentOfArrowFunction(
      'const user = users.find(item => item.email === email)',
      'user',
    ),
  ).to.equal(false);
});
