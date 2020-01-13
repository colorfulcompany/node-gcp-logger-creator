/* global describe, it, beforeEach, afterEach */

const assert = require('power-assert')
const path = require('path')
const fs = require('fs')
const sleep = require('sleep-promise')

const LoggerCreator = require('logger-creator')

class TestingCreatorWithoutOverrindingName extends LoggerCreator {
  name () { return 'example-service' }
}
class TestingCreatorWithoutOverrindingVersion extends LoggerCreator {
  version () { return '1.0' }
}
class TestingCreator extends LoggerCreator {
  name () { return 'example-service' }
  version () { return '1.0' }
}

describe('LoggerCrearor', () => {
  describe('need extends and override name and version', () => {
    describe('no extends', () => {
      it('throws Error', () => {
        assert.throws(
          () => LoggerCreator.create({ env: 'production' })
        )
      })
    })

    describe('extends and override version', () => {
      it('throws LoggerNameNotSpecified', () => {
        assert.throws(
          () => TestingCreatorWithoutOverrindingVersion.create({ env: 'production' }),
          { name: 'LoggerNameNotSpecified' }
        )
      })
    })

    describe('extends and override name', () => {
      it('throws ServiceVersionNotSpecified', () => {
        assert.throws(
          () => TestingCreatorWithoutOverrindingName.create({ env: 'production' }),
          { name: 'ServiceVersionNotSpecified' }
        )
      })
    })
  })

  describe('different level logger', () => {
    it('_level property differ from the other', () => {
      const debug = TestingCreator.create({ level: 'debug', env: 'production' })
      const info = TestingCreator.create({ level: 'info', env: 'production' })

      assert(debug._level !== info._level)
    })
  })

  describe('file logger', () => {
    const file = path.join(__dirname, '../logger.log')
    let logger
    beforeEach(() => {
      logger = TestingCreator.create({ file })
    })
    afterEach(() => {
      fs.unlinkSync(file)
    })

    it('file exists', async () => {
      logger.info('text message')
      await sleep(10)
      assert(fs.readFileSync(file).toString().length > 0)
    })
  })
})
