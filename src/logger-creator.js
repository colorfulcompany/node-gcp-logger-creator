var loggingBunyan

class LoggerNameNotSpecified extends Error {
  get name () { return 'LoggerNameNotSpecified' }
}
class ServiceVersionNotSpecified extends Error {
  get name () { return 'ServiceVersionNotSpecified' }
}

class LoggerCreator {
  /**
   * @param {object} opts
   * @return {object}
   */
  static create (opts = {}) {
    const creator = new this()

    if (opts.env === 'production' || process.env.NODE_ENV === 'production') {
      return creator.bunyanLogger(opts)
    } else {
      return creator.verboseConsole()
    }
  }

  /**
   * @return {string}
   */
  name () {
    throw new LoggerNameNotSpecified()
  }

  /**
   * @return {string}
   */
  version () {
    throw new ServiceVersionNotSpecified()
  }

  /**
   * @return {object}
   */
  verboseConsole () {
    const moment = require('moment')

    return {
      prepend (m) {
        const mes = (typeof m === 'object') ? JSON.stringify(m) : m

        return '[' + moment().format().replace('T', ' ') + '] ' + mes
      },
      fatal (m) { console.error(this.prepend(m)) },
      error (m) { console.error(this.prepend(m)) },
      warn (m) { console.error(this.prepend(m)) },
      info (m) { console.error(this.prepend(m)) },
      debug (m) { console.error(this.prepend(m)) },
      trace (m) { console.error(this.prepend(m)) }
    }
  }

  /**
   * @param {object} opts
   * @return {object}
   */
  bunyanLogger (opts) {
    const bunyan = require('bunyan')
    const { LoggingBunyan } = require('@google-cloud/logging-bunyan')
    loggingBunyan = new LoggingBunyan()

    const level = this.level(opts.level)
    return bunyan.createLogger({
      name: this.name(),
      level,
      streams: this.streams(level),
      serviceContext: this.serviceContext()
    })
  }

  /**
   * @return {string}
   */
  level (level = null) {
    if (level) {
      return level
    } else if (typeof process.env.LOG_LEVEL !== 'undefined') {
      return process.env.LOG_LEVEL
    } else {
      return 'info'
    }
  }

  /**
   * @param {string} level
   * @return {Array}
   */
  streams (level) {
    return (typeof loggingBunyan !== 'undefined')
      ? [loggingBunyan.stream(level)]
      : [{ stream: process.stdout, level }]
  }

  /**
   * @return {object}
   */
  serviceContext () {
    return {
      service: this.name(),
      version: this.version()
    }
  }
}

module.exports = LoggerCreator
