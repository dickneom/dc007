var Sequelize = require('sequelize')

var sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './db/dc.db',
  define: {
//    timestamps: false,
    freezeTableName: true
  }
})

// conentando los modelos, relaciones en la base de datos en un db objeto
var db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Modelos - Tablas
db.User = require('./users')(sequelize, Sequelize)
db.Dress = require('./dresses')(sequelize, Sequelize)
db.Message = require('./messages')(sequelize, Sequelize)
db.Like = require('./wish')(sequelize, Sequelize)

// Relaciones
// Dress* - User1
db.User.hasMany(db.Dress, {
  foreignKey: 'userId',
  as: 'dress'
})

db.Dress.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
})

// Message* - User1
db.Message.belongsTo(db.User, {
  foreignKey: 'userIdTo',
  as: 'userTo'
})

db.Message.belongsTo(db.User, {
  foreignKey: 'userIdFrom',
  as: 'userFrom'
})

db.User.hasMany(db.Message, {
  foreignKey: 'userIdTo',
  as: 'userTo'
})

// Dress1 - Like*
db.Dress.hasMany(db.Like, {
  foreignKey: 'dressId',
  as: 'Likes'
})

db.Like.belongsTo(db.Dress, {
  foreignKey: 'dressId',
  as: 'dress'
})

// User1 - Like*
db.User.hasMany(db.Like, {
  foreignKey: 'userId',
  as: 'Likes'
})

/* db.Like.belongsTo(db.USer, {
  foreignKey: 'userId',
  as: 'user'
}) */

module.exports = db
