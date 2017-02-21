var db = require('../models/db')

var messageInsert = function (mess, cb) {
  db.Message.create(mess).then(function (message) {
    cb(null, message)
  }).catch(function (errors) {
    cb(errors)
  })
}

// middleware para verificar que el usuario de la sesion esta relacionado con el mensaje
// puede ser el que envia o el que recibe
function isMessageOwner (req, res, next) {
  console.log('*** *** *** *** Validando si el usuario esta relacionado con el vestido')
  var messageId = req.params.messageId
  if (!messageId) {
    messageId = req.body.messageId
  }
  console.log('*** *** *** *** Validando si el usuario esta relacionado con el mensaje: ' + messageId)

  if (messageId && messageId !== null) {
    db.Message.findOne({
      where: {
        id: messageId
      }
    })
    .then(function (message) {
      if (message.userIdFrom === req.session.userLoged.id || message.userIdTo === req.session.userLoged.id) {
        console.log('*** *** *** *** El mensage esta relacionado con el usuario logeado')
        next()
      } else {
        console.log('*** *** *** *** No se puede acceder al mensaje. El mensaje no es del usuario logeado')
        res.send('(MESSAGES.JS) No esta autorizado para acceder al mensaje: ' + message.id)
      }
    })
    .catch(function (errors) {
      console.log('(MESSAGES.JS) ERROR en la busqueda del mensaje: ' + errors)
      res.send('ERROR en la busqueda del mensaje: ' + errors)
    })
  } else {
    console.log('(CONTROL) ERROR id del mensaje indefinido.')
    res.send('(CONTROL) ERROR id del mensaje indefinido.')
  }
}

module.exports.isMessageOwner = isMessageOwner
module.exports.messageInsert = messageInsert
