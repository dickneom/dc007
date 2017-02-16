var db = require('../models/db')

function login (email, pass, rememberme, callback) {
    // FALTA LA PARTE DE RECUERDAME
  var error
  var password = encryptPassword(pass)
  db.User.findOne({
    where: {
      email: email,
      password: password
    }
  })
  .then(function (user) {
    if (user) {
      if (user.authenticated) {
        console.log('*** *** *** *** Usuario encontrado: ' + user.fullname)
        callback(null, user)
      } else {
        error = '*** *** *** *** Usuario no autenticado'
        console.log(error)
        callback(error)
      }
    } else {
      error = '*** *** *** *** Usuario y/o contraseña no validos'
      console.log(error)
      callback(error)
    }
  })
  .catch(function (errores) {
    error = '*** *** *** *** Error al realizar la busqueda'
    console.log(error)
    callback(error)
  })
}

function encryptPassword (value) {
  console.log('*** *** *** *** Encriptando password')
  var encript = value + 'a1'
  // falta el algoritmo de algoritmo de encriptamiento
  return encript
}

function sessionInit (req, res, user, rememberme) {
  req.session.userLoged = {
    id: user.id,
    nickname: user.nickname,
    fullname: user.fullname,
    email: user.email,
    admin: user.admin
  }
  console.log('*** *** *** *** Session iniciada')
}

function sessionDestroy (req, res, next) {
  // NO SE ESTA UTILIZANDO YA QUE SE CIERRA LA SESION DESDE EL ROUTER LOGOUT
  req.session.Destroy
  console.log('*** *** *** *** Sesion terminada')
}

// middleware para validar si hay una session abierta
function sessionValidate (req, res, next) {
  console.log('*** *** *** *** Validando session del usuario')
  if (typeof req.session.userLoged === 'undefined') {
    console.log('*** *** *** *** Sesion NO validada')
    res.redirect('/login')
  } else {
    console.log('*** *** *** *** Sesion validada. Usuario: ' + req.session.userLoged.id)
    // Ya esta logeado
    next()
  }
}

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

// Verifica que el usuario este autenticado
function isAuthenticatedUser (user, next) {
  if (user.authenticated) {
    next()
  } else {
    return new Error('Usuario no autenticado.')
  }
}

function encryptEmail (message) {
  console.log('*** *** *** *** Encriptando mensaje de email')
  message = message + ';a1'
  return message
}

function decryptEmail (message) {
  console.log('*** *** *** *** Desencriptando mensaje de email')
  message = message.split(';')[0]
  return message
}

function sendEmail (email, message) {
  console.log('*** *** *** *** Email enviado a: ' + email + ' mensaje: ' + message)
}

module.exports.login = login
module.exports.encryptPassword = encryptPassword
module.exports.sessionInit = sessionInit
module.exports.sessionValidate = sessionValidate
module.exports.isDressOwner = isDressOwner
module.exports.sessionDestroy = sessionDestroy
module.exports.encryptEmail = encryptEmail
module.exports.decryptEmail = decryptEmail
module.exports.sendEmail = sendEmail
