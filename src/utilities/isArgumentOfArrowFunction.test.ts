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
  ['const data = useSWR("x/y", () => sdk.partners())', 'data', false],
  [
    'const { data: partners } = useSWR("x/y", () => sdk.partners())',
    'partners',
    false,
  ],
  [
    'const { data: partners } = useSWR("index/partners", () => sdk.partners())',
    'partners',
    false,
  ],
])(
  'isArgumentOfArrowFunction("%s", "%s") should return %s',
  (loc, arg, expected) => {
    expect(isArgumentOfArrowFunction(loc, arg)).to.equal(expected);
  },
);
