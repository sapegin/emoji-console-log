import { expect, test } from 'vitest';
import { shouldTransformArrowFunction } from './shouldTransformArrowFunction';

test('returns true if anonymous function needs to be transformed', () => {
  const anonymousFunctionsLOCs = [
    'const sayHello = fullName => `Hello ${fullName}`',
    'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
    'fullName => `Hello ${fullName}`',
  ];
  for (const anonymousFunctionLOC of anonymousFunctionsLOCs) {
    expect(shouldTransformArrowFunction(anonymousFunctionLOC)).to.equal(true);
  }
});

test('returns false if anonymous function is already transformed', () => {
  const transformedAnonymousFunctions = [
    'const sayHello = fullName => { `Hello ${fullName}`',
  ];
  for (const transformedAnonymousFunction of transformedAnonymousFunctions) {
    expect(shouldTransformArrowFunction(transformedAnonymousFunction)).to.equal(
      false,
    );
  }
});
