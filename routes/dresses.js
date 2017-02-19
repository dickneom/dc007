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
var dresses = require('../controllers/dresses')
var messages = require('../controllers/messages')

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
router.get('/mycloset', session.sessionValidate, function (req, res, next) {
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

// Actualizar un vestido por el propietario
router.get('/:dressId/update', session.sessionValidate, dresses.isDressOwner, function (req, res, next) {
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

// Actualizar un vestido por el propietario
router.post('/update', session.sessionValidate, dresses.isDressOwner, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/update POST')

  var dressId = req.body.dressId

  db.Dress.findOne({
    where: {
      id: dressId
    },
    include: {
      model: db.User,
      as: 'user'
    }
  }).then(function (dress) {
    dress.title = req.body.title
    dress.description = req.body.description
    dress.colorId = req.body.colorId
    dress.brandId = req.body.brandId
    dress.price = req.body.price
    dress.priceOriginal = req.body.priceOriginal

    dress.save().then(function (dressNew) {
      console.log('*** Vestido actualizado. Id: ' + dressNew.id)
      res.render('dresses/dress_update', {
        pageTitle: 'Actualizar vestido:' + dressNew.title,
        pageName: 'dresses_update',
        sessionUser: req.session.userLoged,
        errors: null,
        dress: dressNew,
        brands: BRANDS,
        colors: COLORS
      })
    }).catch(function (errors) {
      console.log('****** ERROR: ' + errors)
      res.render('dresses/dress_update', {
        pageTitle: 'Actualizar vestido:' + dress.title,
        pageName: 'dresses_update',
        sessionUser: req.session.userLoged,
        errors: errors,
        dress: dress,
        brands: BRANDS,
        colors: COLORS
      })
    })
  })
})

// Agregar un vestido, por un usuario
router.get('/create', session.sessionValidate, function (req, res, next) {
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

// Agregar un vestido, por un usuario
router.post('/create', session.sessionValidate, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/create POST')

  var dress = {}
  dress.title = req.body.title
  dress.description = req.body.description
  dress.colorId = req.body.colorId
  dress.brandId = req.body.brandId
  dress.price = req.body.price
  dress.priceOriginal = req.body.priceOriginal
  dress.userId = req.session.userLoged.id
  dress.image = 'http://res.cloudinary.com/cloud-dc/image/upload/v1487441736/brwltuenzajetyxciozo.png'

  db.Dress.create(dress)
  .then(function (dressNew) {
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
    res.render('dresses/dress_create', {
      pageTitle: 'Actualizar vestido: ' + dress.title,
      pageName: 'dress_update',
      sessionUser: req.session.userLoged,
      errors: errors,
      dress: dress,
      brands: BRANDS,
      colors: COLORS
    })
  })
})

// Cargar imagen de un vestido, por el propietario
router.get('/:dressId/images', session.sessionValidate, dresses.isDressOwner, function (req, res, next) {
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
      dress: dress,
      imageUrl: dress.image
    })
  })
})

// Cargar imagen de un vestido, por el propietario
router.post('/images', session.sessionValidate, uploader.single('image'), dresses.isDressOwner, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/images POST')

  if (req.file) {
    var dressId = req.body.dressId

    db.Dress.findOne({
      where: {
        id: dressId
      },
      include: {
        model: db.User,
        as: 'user'
      }
    }).then(function (dress) {
      cloudinary.uploader.upload(req.file.path, function (result) {
        var fileUrl = result.url
        // var fileSecureUrl = result.secure_url

        dress.image = fileUrl
        dress.stateId = 1
        console.log('********* Vestido a grabar: ' + dress)

        dress.save().then(function (dressNew) {
          res.render('dresses/dress_images', {
            pageTitle: 'Agregar imagen al vestido: ' + dress.title,
            pageName: 'dress_images',
            sessionUser: req.session.userLoged,
            errors: null,
            dress: dressNew,
            imageUrl: dress.image
          })
        }).catch(function (errors) {
          res.render('dresses/dress_images', {
            pageTitle: 'Agregar imagen al vestido: ' + dress.title,
            pageName: 'dress_images',
            sessionUser: req.session.userLoged,
            errors: errors,
            dress: dress,
            imageUrl: dress.image
          })
        })
      })
    })
  }
})

// Publicar o retirar un vestido, por el propietario
router.post('/publish', session.sessionValidate, dresses.isDressOwner, function (req, res, next) {
  console.log('*** ATENDIENDO LA RUTA: /dresses/:dressId/publish GET')

  var dressId = req.body.dressId

  db.Dress.findOne({
    where: {
      id: dressId
    }
  }).then(function (dress) {
    if (dress.stateId !== 2) {
      dress.stateId = 2
    } else {
      dress.stateId = 1
    }
    dress.save().then(function (dressNew) {
      //
      //  enviar mensaje al administrador
      //
      // res.send(req.session.urlGet)
      var message = {}
      message.date = new Date()
      message.userIdFrom = req.session.userLoged.id
      message.userIdTo = -1000
      message.subject = 'Vestido publicado'
      message.text = 'Vestido publicado'
      message.url = '/dresses/' + dressId + '/update'

      messages.messageInsert(message, function (error, messNew) {
        if (error) {
          console.log('Mensage no enviado.')
        }
      })
      res.redirect('/dresses/mycloset')
    })
  }).catch(function (errors) {
    console.log('(DRESSES.JS) Error en la busqueda del vestido.')
    res.send('(DRESSES.JS) Error en la busqueda del vestido.')
  })
})

router.post('/forSaleAcept', function (req, res, next) {
  var dressId = req.body.dressId

  db.Dress.findOne({
    where: {
      id: dressId
    }
  }).then(function (dress) {
    dress.update({stateId: 3})
    var message = {}
    message.date = new Date()
    message.userIdFrom = -1000
    message.userIdTo = dress.user.id
    message.subject = 'Vestido aceptado'
    message.text = 'Vestido aceptado'
    message.url = '/dresses/' + dressId + '/update'

    messages.messageInsert(message, function (error, messNew) {
      if (error) {
        console.log('Mensage no enviado.')
      }
    })
  }).catch(function (errors) {
    console.log('(DRESSES.JS) Error en busqueda el vestido: ' + errors)
  })
})

router.post('/forSaleReject', function (req, res, next) {
  var dressId = req.body.dressId

  db.Dress.findOne({
    where: {
      id: dressId
    }
  }).then(function (dress) {
    dress.update({stateId: 1})

    var message = {}
    message.date = new Date()
    message.userIdFrom = -1000
    message.userIdTo = dress.user.id
    message.subject = 'Vestido rechazado'
    message.text = 'Vestido rechazado'
    message.url = '/dresses/' + dressId + '/update'

    messages.messageInsert(message, function (error, messNew) {
      if (error) {
        console.log('Mensage no enviado.')
      }
    })
  }).catch(function (errors) {
    console.log('(DRESSES.JS) Error en busqueda el vestido: ' + errors)
  })
})

module.exports = router
