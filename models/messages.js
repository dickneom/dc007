// /models/users.js

module.exports = function (sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userIdFrom: {
      type: DataTypes.INTEGER,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      field: 'user_id_from',
      validate: {
        notEmpty: {args: true, msg: 'El usuario origen no puede estar vacio.'}
      }
    },
    userIdTo: {
      type: DataTypes.INTEGER,
      allowNull: {args: false, msg: 'No puede ser nulo.'},
      field: 'user_id_to',
      validate: {
        notEmpty: {args: true, msg: 'El usuario destino no puede estar vacio.'}
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
    subject: {
      type: DataTypes.TEXT,
      allowNull: {args: false, msg: 'No puede ser nulo'},
      notEmpty: true,
      notNull: true,
      validate: {
        len: {args: [6, 400], msg: 'El asunto debe tener de 6 a 100 caracteres'}
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: {args: false, msg: 'No puede ser nulo'},
      notEmpty: true,
      notNull: true,
      validate: {
        len: {args: [6, 400], msg: 'El mensaje debe tener de 6 a 400 caracteres'}
      }
    },
    urlTo: {
      type: DataTypes.TEXT,
      field: 'url_to'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      field: 'is_read',
      default: false
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
    tableName: 'messages',
    timestamp: true,
    paranoid: true
    // aqui faltan las relaciones
  })

  return Message
}
