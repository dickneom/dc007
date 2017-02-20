var express = require('express')
var router = express.Router()

// PARA SUBIR LAS IMAGENES A CLOUDINARY
var cloudinary = require('cloudinary')  // sitio web para almacenar imagenes
var multer = require('multer')   // Para subir archivo (imagenes)
var uploader = multer({dest: './uploads'})

// configuracion de cloudinary para dresscloset
cloudinary.config({
  cloud_name: 'cloud-dc',
  api_key: '315662672528822',
  api_secret: 'HaVwA3NVQfm5cVMeTKYU3O5Di7s'
})

var db = require('../models/db')
var session = require('../controllers/session')

router.use(function (req, res, next) {
  console.log('(USERS.JS) (global) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  if (req.method === 'GET') {
    req.session.urlGet = '/users' + req.url
    console.log('****** (global users) Guardada la ruta: ' + req.session.urlGet)
  }

  next()
})

// lista de usuarios, solo para administradores
// router.get('/', session.sessionValidate, session.isAdmin, function (req, res, next) {
router.get('/', function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var limit = 10
  var page = 1
  var offset
  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.page) {
    page = req.query.page
  }
  offset = limit * (page - 1)
  db.User.findAll({
    limit: limit,
    offset: offset
  }).then(function (users) {
    var user = null
    if (req.session.userLoged) {
      user = req.session.userLoged
    }

    res.render('users/users', {
      pageTitle: 'Lista de usuarios',
      pageName: 'users',
      sessionUser: user,
      errors: null,
      users: users,
      limit: limit,
      pageNumber: page
    })
  }).catch(function (errors) {
    console.log('(USERS.JS) ERROR ' + errors)
    res.send('(USERS.JS) ERROR ' + errors)
  })
})

// ver los datos de un usuario, para propietario
router.get('/profile', session.sessionValidate, function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var userId = req.session.userLoged.id

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    var userLoged = null
    if (req.session.userLoged) {
      userLoged = req.session.userLoged
    }

    res.render('users/user_profile', {
      pageTitle: 'Perfil: ' + user.nickname,
      pageName: 'user_profile',
      sessionUser: userLoged,
      errors: null,
      user: user
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) Error en la busqueda ' + userId)
  })
})

// ver los datos de un usuario, para propietario y administradores
router.get('/:userId([0-9]+)', session.sessionValidate, function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var userId = req.params.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    var userLoged = null
    if (req.session.userLoged) {
      userLoged = req.session.userLoged
    }

    res.render('users/user_view', {
      pageTitle: 'Datos usuario: ' + user.nickname,
      pageName: 'user_view',
      sessionUser: userLoged,
      errors: null,
      user: user
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) Error en la busqueda ' + userId)
  })
})

// Actuzalizar los datos de un usuario, para propietario y administradores
router.get('/:userId([0-9]+)/update', session.sessionValidate, session.isSelf, function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var userId = req.params.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    // var fileSecureUrl = result.secure_url
    console.log('********* Vestido a grabar: ' + user)

    var userLoged = null
    if (req.session.userLoged) {
      userLoged = req.session.userLoged
    }

    res.render('users/user_update', {
      pageTitle: 'Datos usuario: ' + user.nickname,
      pageName: 'user_update',
      sessionUser: userLoged,
      errors: null,
      user: user
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) Error en la busqueda ' + userId)
  })
})

// Actualizar los datos de un usuario, para propietario y administradores
router.post('/update', session.sessionValidate, session.isSelf, function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  var userId = req.body.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    user.nickname = req.body.nickname
    user.fistname = req.body.firstname
    user.lastname = req.bocy.lastname
    user.email = req.body.email

    var userLoged = null
    if (req.session.userLoged) {
      userLoged = req.session.userLoged
    }
    user.save().then(function (userNew) {
      res.render('users/user_view', {
        pageTitle: 'Datos usuario: ' + userNew.nickname,
        pageName: 'user_view',
        sessionUser: userLoged,
        errors: null,
        user: userNew
      })
    }).catch(function (errors) {
      res.render('users/user_view', {
        pageTitle: 'Datos usuario: ' + user.nickname,
        pageName: 'user_view',
        sessionUser: userLoged,
        errors: errors,
        user: user
      })
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) Error en la busqueda del usuario' + errors)
  })
})

// Subir la imagen de un usuario, para propietarios
router.get('/:userId([0-9]+)/images', session.sessionValidate, session.isSelf, function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var userId = req.params.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    // var fileSecureUrl = result.secure_url
    console.log('********* Vestido a grabar: ' + user)

    var userLoged = null
    if (req.session.userLoged) {
      userLoged = req.session.userLoged
    }

    res.render('users/user_images', {
      pageTitle: 'Foto de: ' + user.nickname,
      pageName: 'user_images',
      sessionUser: userLoged,
      errors: null,
      user: user,
      imageUrl: user.picture
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) Error en la busqueda ' + userId)
  })
})

// subir la imagen de un usuario, para propietarios
router.post('/images', session.sessionValidate, uploader.single('image'), session.isSelf, function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  var userId = req.body.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    cloudinary.uṕloader.upload(req.file.path, function (result) {
      user.picture = result.url
      console.log('********* Vestido a grabar: ' + user.picture)

      var userLoged = null
      if (req.session.userLoged) {
        userLoged = req.session.userLoged
      }
      user.save().then(function (userNew) {
        res.render('users/user_images', {
          pageTitle: 'Foto de: ' + user.nickname,
          pageName: 'user_view',
          sessionUser: userLoged,
          errors: null,
          user: user,
          imageUrl: user.picture
        })
      }).catch(function (errors) {
        res.render('users/user_view', {
          pageTitle: 'Datos usuario: ' + user.nickname,
          pageName: 'user_view',
          sessionUser: userLoged,
          errors: errors,
          user: user,
          imageUrl: user.picture
        })
      })
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) ERROR en la busqueda. ' + errors)
  })
})

// crear un usuario, para administradores
router.get('/create', function (req, res, next) {
  res.render('users/user_create', {
    pageTitle: 'Crear usuario',
    pageName: 'dresses/create',
    userLoged: null,
    errors: null,
    user: null
  })
})

// crear un usuario, para administradores
router.post('/create', function (req, res, next) {
  var user = {}
  user.nickname = req.body.nickname
  user.firstname = req.body.firstname
  user.lastname = req.body.lastname
  user.email = req.body.email

  db.User.create(user).then(function (userNew) {
    res.render('users/user_create', {
      pageTitle: 'Crear usuario',
      pageName: 'dresses/create',
      userLoged: null,
      errors: null,
      user: userNew
    })
  }).catch(function (errors) {
    res.render('users/user_create', {
      pageTitle: 'Crear usuario',
      pageName: 'dresses/create',
      userLoged: null,
      errors: errors,
      user: user
    })
  })
})

router.get('/pass_change', function (req, res, next) {
  res.render('users/user_pass_change', {
    pageTitle: 'Cambio de contraseña',
    pageName: 'user_pass_change',
    sessionUser: req.session.userLoged,
    errors: null
  })
})

router.post('/pass_change', function (req, res, next) {
  var userId = req.session.userLoged.id
  var passOld = session.encryptPassword(req.body.passOld)
  var pass1 = req.body.pass1
  var pass2 = req.body.pass2

  var error
  db.User.findOne({
    where: {
      id: userId,
      password: passOld
    }
  }).then(function (user) {
    if (pass1 !== pass2) {
      error = 'Los contraseñas no coinciden.'
      res.render('users/user_pass_change', {
        pageTitle: 'Cambio de contraseña',
        pageName: 'user_pass_change',
        sessionUser: req.session.userLoged,
        errors: [error]
      })
    } else {
      user.update({password: pass1}).thne(function (user) {
        res.send('Contraseña cambiada correctamente!')
      })
    }
  }).catch(function (errors) {
    error = 'Contraseña incorrecta.'
    res.render('users/user_pass_change', {
      pageTitle: 'Cambio de contraseña',
      pageName: 'user_pass_change',
      sessionUser: req.session.userLoged,
      errors: [error]
    })
  })
})

module.exports = router
