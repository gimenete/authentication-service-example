require('dotenv').config()

const express = require('express')
const authenticationService = require('pnp-authentication-service')
const jwt = require('./jwt')()

exports.startServer = (config, callback) => {
  const port = process.env.PORT || 3000
  const app = express()
  app.set('view engine', 'pug')
  app.set('views', './views')

  const router = authenticationService.createRouter({ EMAIL_PORT: 0 })
  app.use('/auth', router)

  app.get('/', (req, res, next) => {
    res.render('index.pug')
  })

  app.get('/callback', (req, res, next) => {
    jwt.verify(req.query.jwt)
      .then(data => {
        res.render('callback.pug', data)
      })
      .catch(next)
  })

  return app.listen(port, callback)
}

if (require.main === module) {
  const server = exports.startServer({}, () => {
    const port = server.address().port
    console.log(`Listening on port ${port}! Visit http://127.0.0.1:${port}/auth`)
  })
}
