'use strict'


require('module').Module._initPaths()
require('dotenv').config()

const cors = require('cors')
const express = require('express')
const router = require('./router')
const serverless = require('serverless-http')

const { serverPort: PORT } = require('./config')

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))
app.use(router)
/*
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON localhost:${PORT}`)
})*/

module.exports.handler = serverless(app)
