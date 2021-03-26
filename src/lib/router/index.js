'use strict'

const router = require('express').Router()
const readFeed = require('./readFeed')
const readRandomFeed = require('./readRandomFeed')
const readTezosLedger = require('./readTezosLedger')
const readObjkt = require('./readObjkt')
const readHdaoFeed = require('./readHdaoFeed')

router.post('/feed', _asyncHandler(readFeed))
router.post('/random', _asyncHandler(readRandomFeed))
router.post('/tz', _asyncHandler(readTezosLedger))
router.post('/objkt', _asyncHandler(readObjkt))
router.post('/hdao', _asyncHandler(readHdaoFeed))

module.exports = router

function _asyncHandler(cb) {
  return function (req, res, next) {
    Promise.resolve(cb(req, res, next)).catch(next)
  }
}
