import tamiaTypeScript from 'eslint-config-tamia/typescript';

export default [
  ...tamiaTypeScript,
  {
    rules: {
      'require-await': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      'unicorn/no-anonymous-default-export': 'off',
    },
  },
  {
    ignores: ['out/', 'src/test/files/', '.vscode-test/'],
  },
];
