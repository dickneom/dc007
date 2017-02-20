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

// Verifica que el usuario logeado es administrador
function isAdmin (req, res, next) {
  if (req.session.userLoged.admin) {
    next()
  } else {
    return new Error('(SESSION.JS) Usuario no es administrador.')
  }
}

// Verificar si el usuario logeado y el usuario editado son los mismos
function isSelf (req, res, next) {
  var userLogedId = req.session.userLoged.id

  console.log('(SESSION.JS) id del usuario como parámetro')
  var userId = req.params.userId
  if (!userId) {
    if (req.method === 'GET') {
      console.log('(SESSION.JS) id del usuario para metodo GET')
      userId = req.query.userId
    } else {
      console.log('(SESSION.JS) id del usuario para metodo POST')
      userId = req.body.userId
    }
  }
  userLogedId = parseInt(userLogedId, 10)
  userId = parseInt(userId, 10)
  console.log('(SESSION.JS) userLogedId: ' + userLogedId + ' - userId: ' + userId)
  console.log('(SESSION.JS) userLogedId === userId: ', userLogedId === userId)
  if (userLogedId === userId) {
    next()
  } else {
    res.send('(SESSION.JS) No está autorizado para hacer esto (no es el propietario).')
  }
}

// Verifica si el usuario logeado es el mismo usuario editado o si es administrador
function isSelfOrAdmin (req, res, next) {
  if (req.session.userLoged.isAdmin) {
    next()
  }

  var userLogedId = req.session.userLoged.id

  console.log('(SESSION.JS) id del usuario como parámetro')
  var userId = req.params.userId
  if (!userId) {
    if (req.method === 'GET') {
      console.log('(SESSION.JS) id del usuario para metodo GET')
      userId = req.query.userId
    } else {
      console.log('(SESSION.JS) id del usuario para metodo POST')
      userId = req.body.userId
    }
  }

  userLogedId = parseInt(userLogedId, 10)
  userId = parseInt(userId, 10)
  if (userLogedId === userId) {
    next()
  }

  res.send('(SESSION.JS) No está autorizado para hacer esto (no es propietario ni administrador).')
}

module.exports.login = login
module.exports.encryptPassword = encryptPassword
module.exports.sessionInit = sessionInit
module.exports.sessionValidate = sessionValidate
module.exports.sessionDestroy = sessionDestroy
module.exports.isAdmin = isAdmin
module.exports.isSelf = isSelf
module.exports.isSelfOrAdmin = isSelfOrAdmin
