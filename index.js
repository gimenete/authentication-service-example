require('dotenv').config()

const path = require('path')
const express = require('express')
const _ = require('lodash')
const cookieSession = require('cookie-session')
const { createJwtClient, createRouter } = require('pnp-authentication-service')
const config = { EMAIL_TEMPLATES_DIR: path.join(__dirname, 'templates') }
const jwt = createJwtClient(config)

exports.startServer = (callback) => {
  const port = process.env.PORT || 3000
  const app = express()
  app.set('view engine', 'pug')
  app.set('views', './views')
  app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

  const router = createRouter(config)
  app.use('/auth', router)

  app.get('/', (req, res, next) => {
    const user = req.session.user
    res.render('index.pug', { user })
  })

  app.get('/home', (req, res, next) => {
    const user = req.session.user
    if (!user) return res.redirect('/auth/signin')
    res.render('home.pug', { user })
  })

  app.get('/callback', (req, res, next) => {
    jwt.verify(req.query.jwt)
      .then(data => {
        const user = _.pick(data.user, ['id', 'firstName', 'lastName', 'image'])
        req.session.user = user
        res.redirect('/home')
      })
      .catch(next)
  })

  app.get('/logout', (req, res, next) => {
    req.session = null
    res.redirect('/')
  })

  const stylesheetFullPath = path.join(__dirname, '/static/stylesheet.css')
  app.get('/stylesheet.css', (req, res, next) => {
    res.sendFile(stylesheetFullPath, {}, err => err && next(err))
  })

  return app.listen(port, callback)
}

if (require.main === module) {
  const server = exports.startServer(() => {
    const port = server.address().port
    console.log(`Listening on port ${port}! Visit http://127.0.0.1:${port}/auth`)
  })
}
