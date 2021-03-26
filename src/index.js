'use strict'

process.env.NODE_PATH = 'src/lib'

require('module').Module._initPaths()
require('dotenv').config()

const cors = require('cors')
const express = require('express')
const router = require('router')

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))
app.use(router)

app.listen(3001)
