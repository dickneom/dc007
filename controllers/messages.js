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
function isDressMsg (req, res, next) {
  console.log('*** *** *** *** Validando si el usuario esta relacionado con el vestido')
  var messageId = req.params.messageId
  if (!messageId) {
    messageId = req.body.messageId
  }
  console.log('*** *** *** *** Validando si el usuario esta relacionado con el mensaje: ' + messageId)

  if (messageId && messageId !== null) {
    db.Dress.findOne({
      where: {
        id: Id
      },
      include: {
        model: db.User,
        as: 'user'
      }
    })
    .then(function (dress) {
      if (dress.user.id === req.session.userLoged.id) {
        console.log('*** *** *** *** Se va ha actualizar un vestido... Vestido encontrado')
        next()
      } else {
        console.log('*** *** *** *** No se puede actualizar el vestido ... no autorizado para editar el vestido')
        res.send('(CONTROL) No esta autorizado a editar del vestido: ' + dress.title)
      }
    })
    .catch(function (errors) {
      console.log('(CONTROL) ERROR en la busqueda del vestido: ' + errors)
      res.send('ERROR en la busqueda del vestido: ' + errors)
    })
  } else {
    console.log('(CONTROL) ERROR id del vestido indefinido.')
    res.send('(CONTROL) ERROR id del vestido indefinido.')
  }
}

module.exports.isDressOwner = isDressOwner
module.exports.messageInsert = messageInsert
