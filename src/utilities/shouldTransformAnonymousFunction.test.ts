import { expect, test } from 'vitest';
import { shouldTransformAnonymousFunction } from './shouldTransformAnonymousFunction';

test('returns true if anonymous function needs to be transformed', () => {
  const anonymousFunctionsLOCs = [
    'const sayHello = fullName => `Hello ${fullName}`',
    'const happyBirthday = (fullName, age) => `Happy ${age} birthday ${fullName}`',
    'fullName => `Hello ${fullName}`',
  ];
  for (const anonymousFunctionLOC of anonymousFunctionsLOCs) {
    expect(shouldTransformAnonymousFunction(anonymousFunctionLOC)).to.equal(
      true,
    );
  }
});

test('returns false if anonymous function is already transformed', () => {
  const transformedAnonymousFunctions = [
    'const sayHello = fullName => { `Hello ${fullName}`',
  ];
  for (const transformedAnonymousFunction of transformedAnonymousFunctions) {
    expect(
      shouldTransformAnonymousFunction(transformedAnonymousFunction),
    ).to.equal(false);
  }
});
