const request = require('@lyle-cli-dev/request')

module.exports = function () {
  return request({
    url: '/project/template'
  })
}
