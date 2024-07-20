# Changelog

## 1.0.4

- Remove unnecessary files form the package.

## 1.1.0

- Avoid repeating the same emojis until the list runs out.
- Automagically add new lines at the right places
- Add more emojis! 🐿️🦐🍋

**Breaking changes:**

- `insertEmptyLineBeforeLogMessage` and `insertEmptyLineAfterLogMessage` options were removed.

## 1.0.3

Another attempt to make the extension work. Apparently, I can't use Prettier directly inside an extension because they use dynamic imports, and extensions don't allow them (except in a worker -- but this would be too complex for the task). I ended up reading Prettier configs manually to read the current file's code style. This seems to work though a bit limited (only JavaScript and JSON configs are supported).

## 1.0.2

- Fix the bundling issue and make the extension work.

## 1.0.0

First version.
