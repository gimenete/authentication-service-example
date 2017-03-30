const jwt = require('jsonwebtoken')

module.exports = env => {
  const algorithm = process.env.JWT_ALGORITHM || 'HS256'
  const isHMAC = algorithm.substring(0, 1) === 'H'
  const secretOrPrivateKey = isHMAC ? process.env.JWT_SECRET : process.env.JWT_PRIVATE_KEY
  const secretOrPublicKey = isHMAC ? process.env.JWT_SECRET : process.env.JWT_PUBLIC_KEY
  const expiresIn = process.env.JWT_EXPIRES_IN
  const notBefore = process.env.JWT_NOT_BEFORE

  return {
    sign (payload, options) {
      const opts = Object.assign({ algorithm, expiresIn, notBefore }, options)
      return new Promise((resolve, reject) => {
        jwt.sign(payload, secretOrPrivateKey, opts, (err, token) => {
          err ? reject(err) : resolve(token)
        })
      })
    },

    verify (token, options) {
      const opts = Object.assign({ algorithm }, options)
      return new Promise((resolve, reject) => {
        jwt.verify(token, secretOrPublicKey, opts, (err, decoded) => {
          err ? reject(err) : resolve(decoded)
        })
      })
    }
  }
}
