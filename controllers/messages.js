var db = require('../models/db')

var messageInsert = function (mess, cb) {
  db.Message.create(mess).then(function (message) {
    cb(null, message)
  }).catch(function (errors) {
    cb(errors)
  })
}

module.exports.messageInsert = messageInsert
