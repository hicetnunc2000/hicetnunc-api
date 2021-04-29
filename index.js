'use strict'

require('module').Module._initPaths()
require('dotenv').config()

const cors = require('cors')
const express = require('express')
const compression = require('compression')
const router = require('./lib/router/router')
const serverless = require('serverless-http')

const { serverPort: PORT } = require('./lib/config')

const app = express()

app.use(compression())
app.use(express.json())
app.use(cors({ origin: '*' }))
app.use(router)

if (process.env.NODE_ENV === 'development') {
  app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON localhost:${PORT}`)
  })
}
module.exports.handler = serverless(app)
