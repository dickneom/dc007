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

// Relaciones
db.User.hasMany(db.Dress, {
	foreignKey: 'userId',
	as: 'dress'
})
db.Dress.belongsTo(db.User, {
	foreignKey: 'userId',
	as: 'user'
})
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

module.exports = db
