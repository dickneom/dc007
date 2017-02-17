function encryptEmail (message) {
  console.log('*** *** *** *** Encriptando mensaje de email')
  message = message + ';a1'
  return message
}

function decryptEmail (message) {
  console.log('*** *** *** *** Desencriptando mensaje de email')
  message = message.split(';')[0]
  return message
}

function sendEmail (email, message) {
  console.log('*** *** *** *** Email enviado a: ' + email + ' mensaje: ' + message)
}

module.exports.encryptEmail = encryptEmail
module.exports.decryptEmail = decryptEmail
module.exports.sendEmail = sendEmail