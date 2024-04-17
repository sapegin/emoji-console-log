# Official Website

https://www.turboconsolelog.io

# Main Functionality

Turbo Console Log extension makes debugging much easier by automating the operation of writing meaningful log message.

## Sponsorship

Since the extension is free and open source, we need your support to continue developing and maintaining it. If you are interested in sponsoring the project, u can do it through the following [Link](https://donate.stripe.com/3cs28j2es9mxaGI7st) or contact us at sponsorship@turboconsolelog.io. For more information please visit: https://www.turboconsolelog.io/sponsorship

## Core Features

Full documentation of the core features can be found in the official website: https://www.turboconsolelog.io/documentation/features

### I) Insert a meaningful log message

Two steps:

- Selecting or hovering the variable which is the subject of the debugging (Manual selection will always take over the hover selection)

- Pressing ctrl + alt + L (Windows) or ctrl + option + L (Mac)

The log message will be inserted in the next line relative to the selected variable like the following:

`console.log('🚀 ~ classWrappingVariable ~ functionWrappingVariable ~ variable', variable);`

The log function and the content of the log message can be customized in the extension settings (see Settings section for more details).

Multiple cursor selection is also supported.

[<u>See It In Action</u>](https://www.turboconsolelog.io/documentation/features/insert-log-message)

### II) Comment all log messages, inserted by the extension, from the current document

All it takes to comment all log messages, inserted by the extension, from the current document is to press alt + shift + c (Windows) or option + shift + c (Mac)

[<u>See It In Action</u>](https://www.turboconsolelog.io/documentation/features/comment-inserted-log-messages)

### III) Uncomment all log messages, inserted by the extension, from the current document

All it takes to uncomment all log messages, inserted by the extension, from the current document is to press alt + shift + u (Windows) or option + shift + u (Mac)

[<u>See It In Action</u>](https://www.turboconsolelog.io/documentation/features/uncomment-log-messages)

### IV) Delete all log messages, inserted by the extension, from the current document

All it takes to delete all log messages, inserted by the extension, from the current document is to press alt + shift + d (Windows) or option + shift + d (Mac)

[<u>See It In Action</u>](https://www.turboconsolelog.io/documentation/features/delete-log-messages)

## Settings

Full documentation of the settings can be found in the official website: https://www.turboconsolelog.io/documentation/settings

Properties:

| Feature                              | Description                                                                                                                 | Setting                         | Default     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| Log Type                             | The type of the log message                                                                                                 | logType                         | log         |
| Custom Log Function                  | Custom log function to use in the inserted log message, when specified logType property will be ignored                     | logFunction                     | console.log |
| Insert Empty Line After Log Message  | Whether to insert an empty line after the log message or not                                                                | insertEmptyLineAfterLogMessage  | true        |

## Roadmap

https://www.turboconsolelog.io/roadmap

## Articles

- [<u>Introducing Our New Website</u>](https://www.turboconsolelog.io/articles/introducing-new-website)
- [<u>Motivation behind Turbo Console Log</u>](https://www.turboconsolelog.io/articles/motivation-behind-tcl)

## Contact

- Support: [support@turboconsolelog.io](mailto:support@turboconsolelog.io)
- Feedback: [feedback@turboconsolelog.io](mailto:feedback@turboconsolelog.io)
- Sponsorship: [sponsorship@turboconsolelog.io](mailto:sponsorship@turboconsolelog.io)

## Release Notes

See the [<u>Changelog file</u>](https://marketplace.visualstudio.com/items/ChakrounAnas.turbo-console-log/changelog) for details.

## Participate

You're more than welcome to participate in the development of the extension by creating pull requests and submitting issues, link of the project in github: https://github.com/Chakroun-Anas/turbo-console-log

## License

MIT Copyright &copy; Turbo Console Log
