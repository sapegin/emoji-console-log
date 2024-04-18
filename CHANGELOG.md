# Changelog

## 1.0.3 2024-04-18

Another attempt to make the extension work. Apparently, I can't use Prettier directly inside an extension because they use dynamic imports, and extensions don't allow them (except in a worker -- but this would be too complex for the task). I ended up reading Prettier configs manually to read the current file's code style. This seems to work though a bit limited (only JavaScript and JSON configs are supported).

## 1.0.2 2024-04-18

Fix the bundling issue and make the extension work.

## 1.0.0 2024-04-18

First version.
