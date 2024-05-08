'use strict'

module.exports = core

const pkg = require('../package.json')
const log = require('@lyle-cli-dev/log')

function core() {
  checkPkgVersion()
}

function checkPkgVersion() {
  log.info('cli', pkg.version)
}
