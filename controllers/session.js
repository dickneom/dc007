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

// Verifica que el usuario este autenticado
function isAuthenticatedUser (user, next) {
  if (user.authenticated) {
    next()
  } else {
    return new Error('Usuario no autenticado.')
  }
}

// Verifica que el usuario este autenticado
function isAdmin (req, res, next) {
  if (req.session.userLoged.admin) {
    next()
  } else {
    return new Error('Usuario no es administrador.')
  }
}

module.exports.login = login
module.exports.encryptPassword = encryptPassword
module.exports.sessionInit = sessionInit
module.exports.sessionValidate = sessionValidate
module.exports.sessionDestroy = sessionDestroy
module.exports.isAdmin = isAdmin
