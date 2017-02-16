var express = require('express');
var router = express.Router();

var db = require('../models/db')

router.use(function (req, res, next) {
  console.log('****** (global users) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  if (req.method === 'GET') {
    req.session.urlGet = '/users' + req.url
    console.log('****** (global users) Guardada la ruta: ' + req.session.urlGet)
  }

  next()
})

/* GET users listing. */
router.get('/', function (req, res, next) {
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
});

router.get('/:userId([0-9]+)', function (req, res, next) {
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

router.get('/:userId/update', function (req, res, next) {
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

router.post('/update', function (req, res, next) {
  console.log('')
})

router.get('/:userId/images')

router.post('/images')

router.get('/create')

router.post('/create')

module.exports = router;
