// /models/Wishs.js

module.exports = function (sequelize, DataTypes) {
  var Like = sequelize.define('Like', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      field: 'user_id',
      validate: {
        notEmpty: {args: true, msg: 'El usuario no puede estar vacio.'}
      }
    },
    dressId: {
      type: DataTypes.INTEGER,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      field: 'dress_id',
      validate: {
        notEmpty: {args: true, msg: 'El vestido no puede estar vacio.'}
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      validate: {
        notEmpty: {args: true, msg: 'La fecha no puede estar vacia.'},
        isDate: {args: true, msg: 'Formato de fecha no valido.'},
        isEmpty: function (value) {
          if (value.length === 0) {
            throw new Error('La fecha no puede estar vacia.')
          }
        }
      }
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      default: false,
      field: 'is_deleted'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at'
    }
  }, {
    tableName: 'dresses_Likes',
    timestamp: true,
    paranoid: true
    // aqui faltan las relaciones
  })

  return Like
}
