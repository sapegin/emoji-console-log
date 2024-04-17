# Emoji Console Log Visual Studio Code extension

Visual Studio Code extension to insert `console.log()` statement with a random emoji and a variable (object, function, etc.) under your cursor to make debugging JavaScript and TypeScript code easier.

This is a fork of the [Turbo Console Log](https://www.turboconsolelog.io) extension. The main differences are:

- Significantly simpler and doesn’t come with a lot of options, doesn’t add class name, file name, line number, etc, only the variable name.
- Adds random emoji to each log
- [WIP] Automatically detects the project’s code style settings (quotes, semicolons, etc.).

## Features

### Insert a meaningful log message

Place a cursor or select the variable that you want to log, and press **Ctrl+Alt+L** (Windows) or **Ctrl+Option+L** (Mac).

The log message will be inserted in the next line relative to the selected variable like so:

```js
console.log('🦆 variable', variable);
```

Multiple cursor selection is also supported.

### Comment all log messages, inserted by the extension, in the open file

Press **Shift+Alt+C** (Windows) or **Shift+Option+C** (Mac).

### Uncomment all log messages, inserted by the extension, in the open file

Press **Shift+Alt+U** (Windows) or **Shift+Option+U** (Mac).

### Delete all log messages, inserted by the extension, in the open file

Press **Shift+Alt+D** (Windows) or **Shift+Option+D** (Mac).

## Settings

You can change the following options in the Code preferences:

| Description | Setting | Default |
| --- | --- | --- |
| Log function to use in the inserted log message | `logFunction` | `console.log` |
| Whether to insert an empty line before the log message | `insertEmptyLineBeforeLogMessage` | false |
| Whether to insert an empty line after the log message | `insertEmptyLineAfterLogMessage` | true |

## Motivation

Using `console.log()` is my favorite way of debugging JavaScript and TypeScript code. I’ve been trying to learn more fancy techniques, like a debugger, but I always come back to `console.log()`, because it’s the simplest and it works for me.

The way I do it is by adding a separate log for each variable I want to track, like so: `console.log('🍕 variable', variable)`. I always add a different emoji at the beginning, so it’s easy to differentiate logs in the browser console.

I wanted the easiest way to manage such logs so I found the [Turbo Console Log](https://www.turboconsolelog.io) extension that does most of what I wanted but not in a way I’d like. I decided to make a fork instead of contributing more options to the original extension because I felt my vision would be very different from the vision of the original extension.

## Changelog

The changelog can be found on the [Changelog.md](./Changelog.md) file.

## Sponsoring

This software has been developed with lots of coffee, buy me one more cup to keep it going.

<a href="https://www.buymeacoffee.com/sapegin" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/lato-orange.png" alt="Buy Me A Coffee" height="51" width="217"></a>

## Contributing

Bug fixes are welcome, but not new features. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me), and [contributors](https://github.com/sapegin/emoji-console-log/graphs/contributors).

This extension is based on [Turbo Console Log](https://github.com/Chakroun-Anas/turbo-console-log) by [ Chakroun Anas](https://github.com/Chakroun-Anas) and its [contributors](https://github.com/Chakroun-Anas/turbo-console-log/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
