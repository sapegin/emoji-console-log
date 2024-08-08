import { expect, test } from 'vitest';
import { isAnonymousFunction } from './isAnonymousFunction';

test('returns true if the LOC is an anonymous function', () => {
  const anonymousFunctionsLOCs = [
    'const sayHello = fullName => `Hello ${fullName}`',
    'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
    'fullName => `Hello ${fullName}`',
  ];
  for (const anonymousFunctionLOC of anonymousFunctionsLOCs) {
    expect(isAnonymousFunction(anonymousFunctionLOC)).to.equal(true);
  }
});
