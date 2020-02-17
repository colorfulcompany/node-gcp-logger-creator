const bunyan = require('bunyan')

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
      return creator.bunyanGoogleLogger(opts)
    } else if (typeof opts.file !== 'undefined') {
      return creator.bunyanFileLogger(opts)
    } else {
      return creator.bunyanFlatLogger(opts)
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

  bunyanFlatLogger (opts) {
    const { FunBunyan } = require('fun-bunyan')
    return new FunBunyan({
      level: this.level(opts.level),
      streams: [{
        level: this.level(opts.level),
        stream: process.stdout
      }]
    })
  }

  /**
   * @param {object} opts
   * @return {object}
   */
  bunyanFileLogger (opts) {
    return bunyan.createLogger({
      name: this.name(),
      streams: [{
        path: opts.file,
        level: this.level(opts.level)
      }]
    })
  }

  /**
   * @param {object} opts
   * @return {object}
   */
  bunyanGoogleLogger (opts) {
    const { LoggingBunyan } = require('@google-cloud/logging-bunyan')
    loggingBunyan = new LoggingBunyan()

    const level = this.level(opts.level)
    return bunyan.createLogger({
      name: this.name(),
      level,
      streams: [loggingBunyan.stream(level)],
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
