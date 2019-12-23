# Google Cloud Logger Client Creator

## Features

 * zero config @google-cloud/logging-bunyan client with ES6-class style
 * fallback automatically to console object for development environment

## How To Install

add as below in package.json

```json
"gcp-logger-creator": "https://github.com/colorfulcompany/node-gcp-logger-creator"
```

or

```
$ npm install https://github.com/colorfulcompany/node-gcp-logger-creator
```

## How To Use


```javascript
const LoggerCreator = require('gcp-logger-creator')

class CustomLoggerCreator extends LoggerCreator {
  name () {
    return 'custom-function'
  }

  version () {
    return '1.0'
  }
}

module.exports = CustomLoggerCreator.create({ level: 'debug' })
```
