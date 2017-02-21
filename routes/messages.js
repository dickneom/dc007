var express = require('express')
var router = express.Router()

var db = require('../models/db')
var session = require('../controllers/session')
var dresses = require('../controllers/dresses')
var messages = require('../controllers/messages')

router.use(function (req, res, next) {
  console.log('****** (MESSAGES.JS) (global) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  if (req.method === 'GET') {
    req.session.urlGet = '/messages' + req.url
    console.log('****** (MESSAGES.JS) (global) Guardada la ruta: ' + req.session.urlGet)
  }

  next()
})

// liseta de mensajes para el propietario
router.get('/', session.sessionValidate, function (req, res, next) {
  console.log('****** (MESSAGES.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  var where
  if (req.session.userLoged.isAdmin) {
    where = {
      userIdTo: [req.session.userLoged.id, -1000]
    }
  } else {
    where = {
      userIdTo: req.session.userLoged.id
    }
  }

  db.Message.findAll(where).then(function (messages) {
    console.log('(MESSAGES.JS) Mensajes buscados con exito')
    res.render('messages/messages', {
      pageTitle: 'Mensajes',
      pageName: 'messages',
      sessionUser: req.session.userLoged,
      errors: null,
      messages: messages
    })
  }).catch(function (errors) {
    res.send('(MESSAGES.JS) ERROR en la busqueda: ' + errors)
  })
})

router.get('/:messageId', session.sessionValidate, function (req, res, next) {
  console.log('****** (MESSAGES.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  var messageId = req.params.messageId

  db.Message.findOne({
    where: {
      id: messageId
    },
    include: [{
      model: db.User,
      as: 'userTo'
    }, {
      model: db.User,
      as: 'userFrom'
    }]
  }).then(function (message) {
    message.update({isRead: true})
    res.render('messages/message_view', {
      pageTitle: 'Viendo mensaje',
      pageName: 'message_view',
      sessionUser: req.session.userLoged,
      errors: null,
      message: message
    })
  }).catch(function (errors) {
    res.send('(MESSAGES.JS) ERROR en la busqueda: ' + errors)
  })
})

module.exports = router
