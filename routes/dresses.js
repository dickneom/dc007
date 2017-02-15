var express = require('express')
var router = express.Router()

var db = require('../models/db')

router.use(function (req, res, next) {
  console.log('****** (global dresses) ATENDIENDO LA RUTA: ' + req.url + ' METODO: ' + req.method)

  if (req.method === 'GET') {
    req.session.urlGet = '/dresses' + req.url
    console.log('****** (global dresses) Guardada la ruta: ' + req.session.urlGet)
  }

  next()
})

// CONSTANTES QUE DEBERIAN ESTAR EN LAS TABLAS DE LAS BASE DE DATOS
const BRANDS = [{id: 1, title: 'Zara'},
    {id: 2, title: 'Chino'},
    {id: 3, title: 'Victoria Secrets'},
    {id: 4, title: 'Calvin Klein'},
    {id: 5, title: 'MiMarca'}]

const STATES = [{id: 1, title: 'REGISTRADO'},
    {id: 2, title: 'PUBLICADO'},
    {id: 3, title: 'EN VENTA'}]

const COLORS = [{id: 1, color: 'BLANCO'},
    {id: 2, color: 'NEGRO'},
    {id: 3, color: 'ROJO'},
    {id: 4, color: 'AZUL'},
    {id: 5, color: 'VERDE'},
    {id: 6, color: 'GRIS'},
    {id: 7, color: 'ROSADO'},
    {id: 8, color: 'MORADO'},
    {id: 9, color: 'AMARILLO'},
    {id: 10, color: 'NARANJA'},
    {id: 11, color: 'MARRON'},
    {id: 12, color: 'VIOLETA'},
    {id: 13, color: 'CELESTE'},
    {id: 14, color: 'DORADO'},
    {id: 15, color: 'PLATEADO'}]

const NUM_DRESSES_FOR_PAGE = 9

// RUTAS PARA TODOS LOS VISITANTES

// Ver una lista de vestidos, para todos los usuarios
router.get('/', function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses GET')
  var limit = NUM_DRESSES_FOR_PAGE
  var page = 1
  if (req.query.limit) { limit = req.query.limit }
  if (req.query.page) { page = req.query.page }
  var offset = limit * (page - 1)
  console.log('*** Buscar: limit: ' + limit + ' page: ' + page + ' offset: ' + offset)
  db.Dress.findAll({
    where: {
      stateId: 3 // solo vestidos en venta
    },
    limit: limit,
    offset: offset,
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dresses) {
    for (var index in dresses) {
      if (dresses.hasOwnProperty(index)) {
        console.log('*** Dress: ' + dresses[index].title)
      }
    }

    var sessionUser = null
    if (req.session && req.session.userLoged) {
      sessionUser = req.session.userLoged
    }
    res.render('dresses/dresses', {
      pageTitle: 'Lista de vestidos',
      pafeName: 'dresses',
      sessionUser: sessionUser,
      errors: null,
      dresses: dresses,
      limit: limit,
      pageNumber: page
    })
  })
})

// Ver un vestido, pora todos los visitantes
router.get('/:dressId([0-9]+)', function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId GET')
  var dressId = req.params.dressId
  db.Dress.findOne({
    where: {
      id: dressId
    },
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dress) {
    var brand = BRANDS[dress.brandId - 1].title
    var state = STATES[dress.stateId - 1].title
    var color = COLORS[dress.colorId - 1].color

    var sessionUser = null
    if (req.session && req.session.userLoged) {
      sessionUser = req.session.userLoged
    }
    res.render('dresses/dress_view', {
      pageTitle: 'Vestido: ' + dress.title,
      pageName: 'dress_view',
      sessionUser: sessionUser,
      errors: null,
      dress: dress,
      brand: brand,
      state: state,
      color: color
    })
  })
})

// RUTAS PARA USUARIOS REGISTRADOS

// Lista de los vestidos favoritos
// Agregar un vestido a favoritos
// Quitar un vestido de favoritos
// Comprar un vestido
// Cancelar una compra

// RUTAS PARA PROPIETARIOS

// Lista de vestidos para usuarios registrados
router.get('/mycloset', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/mycloset GET')

  var limit = NUM_DRESSES_FOR_PAGE
  var page = 1
  if (req.query.limit) { limit = req.query.limit }
  if (req.query.page) { page = req.query.page }
  var offset = limit * (page - 1)
  console.log('*** Buscar: limit: ' + limit + ' page: ' + page + ' offset: ' + offset)
  db.Dress.findAll({
    where: {
      userId: req.session.userLoged.id,
      stateId: [1, 2, 3]
    },
    limit: limit,
    offset: offset,
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dresses) {
    for (var index in dresses) {
      if (dresses.hasOwnProperty(index)) {
        console.log('*** Dress: ' + dresses[index].title)
      }
    }

    var sessionUser = null
    if (req.session && req.session.userLoged) {
      sessionUser = req.session.userLoged
    }
    res.render('dresses/dresses_mycloset', {
      pageTitle: 'Lista de vestidos',
      pageName: 'dresses_mycloset',
      sessionUser: sessionUser,
      errors: null,
      dresses: dresses,
      limit: limit,
      pageNumber: page
    })
  })
})

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

router.get('/:dressId/update', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/update GET')

  var dressId = req.params.dressId

  db.Dress.findOne({
    where: {
      id: dressId
    },
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dress) {
    res.render('dresses/dress_update', {
      pageTitle: 'Actualizar vestido: ' + dress.title,
      pageName: 'dress_update',
      sessionUser: req.session.userLoged,
      errors: null,
      dress: dress,
      brands: BRANDS,
      colors: COLORS
    })
  })
})

router.post('/:dressId/update', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/update POST')
  res.send('*** ATENDIENDO LA RUTA: /dresses/:dressId/update POST')
})

router.get('/create', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/create GET')
  res.render('dresses/dress_create', {
    pageTitle: 'Agregar vestido',
    pageName: 'dress_create',
    sessionUser: req.session.userLoged,
    errors: null,
    dress: null,
    brands: BRANDS,
    colors: COLORS
  })
})

router.post('/create', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/create POST')

/*  var dress = {}
  dress.title = req.body.title
  dress.description = req.body.description
  dress.colorId = req.body.colorId
  dress.brandId = req.body.brandId
  dress.price = req.body.price
  dress.priceOriginal = req.body.priceOriginal
  dress.userId = req.session.userLoged.id */

  db.Dress.create({
    title: req.body.title,
    description: req.body.description,
    colorId: req.body.colorId,
    brandId: req.body.brandId,
    price: req.body.price,
    priceOriginal: req.body.priceOriginal,
    userId: req.session.userLoged.id
  }).then(function (dressNew) {
    if (dressNew) {
      console.log('Vestido creado')
      console.log('id: ' + dressNew.id)
    }
    res.render('dresses/dress_create', {
      pageTitle: 'Actualizar vestido: ' + dressNew.title,
      pageName: 'dress_update',
      sessionUser: req.session.userLoged,
      errors: null,
      dress: dressNew,
      brands: BRANDS,
      colors: COLORS
    })
  }).catch(function (errors) {
    console.log('****** ERROR: ' + errors)
    res.send(errors)
      /* res.render('dresses/dress_create', {
      pageTitle: 'Actualizar vestido: ' + dress.title,
      pageName: 'dress_update',
      sessionUser: req.session.userLoged,
      errors: errors,
      dress: dress,
      brands: BRANDS,
      colors: COLORS
    }) */
  })
})

router.get('/:dressId/images', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/images GET')

  var dressId = req.params.dressId

  db.Dress.findOne({
    where: {
      id: dressId
    },
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dress) {
    res.render('dresses/dress_images', {
      pageTitle: 'Agregar imagen al vestido: ' + dress.title,
      pageName: 'dress_images',
      sessionUser: req.session.userLoged,
      errors: null,
      dress: dress
    })
  })
})

router.post('/:dressId/images', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/images POST')
  res.send('*** ATENDIENDO LA RUTA: /dresses/images POST')
})

router.get('/:dressId/publish', sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/publish GET')
  res.send('*** ATENDIENDO LA RUTA: /dresses/:dressId/publish GET')
})

module.exports = router
