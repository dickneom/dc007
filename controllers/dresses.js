var db = require('../models/db')

// middleware para verificar que el usuario de la sesion es el dueño del vestido
function isDressOwner (req, res, next) {
  console.log('*** *** *** *** Validando si el usuario es el propietario del vestido')
  var dressId = req.params.dressId
  if (!dressId) {
    dressId = req.body.dressId
  }
  console.log('*** *** *** *** Validando si el usuario es el propietario del vestido: ' + dressId)

  if (dressId && dressId !== null) {
    db.Dress.findOne({
      where: {
        id: dressId
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
