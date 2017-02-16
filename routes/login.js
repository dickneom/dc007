var express = require('express')
var router = express.Router()

var db = require('../models/db')

router.get('/', function (req, res, next) {
  res.render('login/login', {
    pageTitle: 'Ingreso',
    pageName: 'login',
    sessionUser: null,
    errors: null
  })
})

router.post('/', function (req, res, next) {
  var error
  var email = req.body.email
  var password = encryptPassword(req.body.password)
  var rememberme = req.body.rememberme

  db.User.findOne({
    where: {
      email: email,
      password: password
    }
  }).then(function (user) {
    if (user) {
      if (user.authenticated) {
        console.log('(LOGIN.JS) ****** Usuario validado y autentidado')
        req.session.userLoged = {
          id: user.id,
          nickname: user.nickname,
          fullname: user.fullname,
          email: user.email,
          isAdmin: user.isAdmin
        }
        console.log('****** Redirecsionando a: ' + req.session.urlGet)
        if (req.session.urlGet) {
          res.redirect(req.session.urlGet)
        } else {
          res.redirect('/')
        }
      } else {
        error = 'Usuario validado pero no autentidado'
        console.log('*** ERROR: ' + error)
        res.render('login/login', {
          pageTitle: 'Ingreso',
          pageName: 'login',
          sessionUser: null,
          errors: [error]
        })
      }
    } else {
      error = 'Email y/o password no validos'
      console.log('*** ERROR: ' + error)
      res.render('login/login', {
        pageTitle: 'Ingreso',
        pageName: 'login',
        sessionUser: null,
        errors: [error]
      })
    }
  }).catch(function (errors) {
    console.log('*** ERROR: en la busqueda (login.js)' + errors)
    res.send(errors)
  })
})

function encryptPassword (value) {
  console.log('*** *** *** *** Encriptando password')
  var encript = value + 'a1'
  // falta el algoritmo de algoritmo de encriptamiento
  return encript
}

module.exports = router
