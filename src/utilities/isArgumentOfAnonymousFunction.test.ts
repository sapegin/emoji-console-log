import { expect, test } from 'vitest';
import { isArgumentOfArrowFunction } from './isArgumentOfArrowFunction';

test('returns true if the indicated parameter is an argument of the anonymous function', () => {
  const anonymousFunctionsArguments = [
    {
      loc: 'const sayHello = fullName => `Hello ${fullName}`',
      arg: 'fullName',
    },
    {
      loc: 'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
      arg: 'fullName',
    },
    {
      loc: 'fullName => `Hello ${fullName}`',
      arg: 'fullName',
    },
    {
      loc: 'const user = users.find(item => item.email === email)',
      arg: 'item',
    },
  ];
  for (const { loc, arg } of anonymousFunctionsArguments) {
    expect(isArgumentOfArrowFunction(loc, arg)).to.equal(true);
  }
});

test('returns false if the indicated parameter is not an argument of the anonymous function', () => {
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
