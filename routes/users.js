var express = require('express');
var router = express.Router();

var db = require('../models/db')

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
  if (req.query.limit)
    limit = req.query.limit
  if (req.query.page)
    page = req.query.page
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

// ver los datos de un usuario, para propietario y administradores
router.get('/:userId([0-9]+)', function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var userId = req.params.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    var userLoged = null
    if (req.session.userLoged)
      userLoged = req.session.userLoged

    res.render('users/user_view', {
      pageTitle: 'Datos usuario: ' + user.nickname,
      pageName: 'user_view',
      sessionUser: userLoged,
      errors: null,
      user: user
    })
  }).catch(function (errors){
    res.send('(USERS.JS) Error en la busqueda ' + userId)
  })
})

// Actuzalizar los datos de un usuario, para propietario y administradores
router.get('/:userId/update', function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var userId = req.params.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    var userLoged = null
    if (req.session.userLoged)
      userLoged = req.session.userLoged

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

// Actualizar los datos de un usuario, para propietario y administradores
router.post('/update', function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  var userId = req.body.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    user.nickname = req.body.nickname
    user.email = req.body.email

    user.save().then(function (userNew) {
      res.render('users/user_view', {
        pageTitle: 'Datos usuario: ' + user.nickname,
        pageName: 'user_view',
        sessionUser: userLoged,
        errors: errors,
        user: userNew
      })
    }).catch( function (errors) {
      res.render('users/user_view', {
        pageTitle: 'Datos usuario: ' + user.nickname,
        pageName: 'user_view',
        sessionUser: userLoged,
        errors: errors,
        user: user
      })
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) Error en la busqueda del usuario')
  })
})

// Subir la imagen de un usuario, para propietarios
router.get('/:userId/images', function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)
  var userId = req.params.userId

  db.User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    var userLoged = null
    if (req.session.userLoged)
      userLoged = req.session.userLoged

    res.render('users/user_images', {
      pageTitle: 'Foto de: ' + user.nickname,
      pageName: 'user_view',
      sessionUser: userLoged,
      errors: null,
      user: user
    })
  }).catch(function (errors) {
    res.send('(USERS.JS) Error en la busqueda ' + userId)
  })
})

// subir la imagen de un usuario, para propietarios
router.post('/images', function (req, res, next) {
  console.log('(USERS.JS) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)


})

// crear un usuario, para administradores
router.get('/create')

// crear un usuario, para administradores
router.post('/create')

module.exports = router;
