'use strict'

const router = require('express').Router()
const readFeed = require('./readFeed')
const readRandomFeed = require('./readRandomFeed')
const readIssuer = require('./readIssuer')
const readObjkt = require('./readObjkt')
const readHdaoFeed = require('./readHdaoFeed')
const readRecommendCurate = require('./readRecommendCurate')
const readBlocklists = require('./readBlocklists')

const MILLISECOND_MODIFIER = 1000
const ONE_MINUTE_MILLIS = 60 * MILLISECOND_MODIFIER
const DEFAULT_CACHE_TTL = 60 * 10
const STATUS_CODE_SUCCESS = 200
const CACHE_MAX_AGE_MAP = {
  hdao: 300,
  issuer: 120,
  objkt: 120,
  random: 300,
  recommendCurate: 300,
  blocklists: 300,
}

router
  .route('/feed|/featured')
  .all(_processClientCache)
  .get((req, res, next) => {
    req.body.max_time = req.query.max_time
    req.body.counter = req.query.counter

    return next()
  }, _asyncHandler(readFeed))
  .post(_asyncHandler(readFeed))

router
  .route('/random')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.random)

    return next()
  })
  .get((req, res, next) => {
    req.body.counter = req.query.counter
    return next()
  }, _asyncHandler(readRandomFeed))
  .post(_asyncHandler(readRandomFeed))

router
  .route('/tz')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.issuer)

    return next()
  })
  .get((req, res, next) => {
    req.body.tz = req.query.tz

    return next()
  }, _asyncHandler(readIssuer))
  .post(_asyncHandler(readIssuer))

router
  .route('/objkt')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.objkt)

    return next()
  })
  .get((req, res, next) => {
    req.body.objkt_id = req.query.id

    return next()
  }, _asyncHandler(readObjkt))
  .post(_asyncHandler(readObjkt))

router
  .route('/hdao')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.hdao)

    return next()
  })
  .get((req, res, next) => {
    req.body.counter = req.query.counter

    return next()
  }, _asyncHandler(readHdaoFeed))
  .post(_asyncHandler(readHdaoFeed))

router.get(
  '/recommend_curate',
  (req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.recommendCurate)

    return next()
  },
  _asyncHandler(readRecommendCurate)
)

router.get(
  '/blocklist',
  (req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.blocklists)

    return next()
  },
  _asyncHandler(readBlocklists)
)

module.exports = router

/**
 * Express cannot process promise rejections correctly. We need to encapsulate async
 * route handlers with logic to pass promise rejections to express's middleware chain
 * as an error.
 */
function _asyncHandler(cb) {
  return function (req, res, next) {
    Promise.resolve(cb(req, res, next)).catch(next)
  }
}

/**
 * Set the fetch time for conseil requests and set the Cache-Control header
 * on successful responses.
 */
function _processClientCache(req, res, next) {
  const clientCacheMaxAge = req.body.max_time || req.query.max_time
  const isValidClientCacheTime = Number.isInteger(clientCacheMaxAge)
  const now = Date.now()
  const fetchTime = isValidClientCacheTime
    ? clientCacheMaxAge
    : _floorTimeToMinute(now)

  // Set fetch time for feed conseil requests
  req.feedFetchAt = fetchTime

  const isImmutable = isValidClientCacheTime && clientCacheMaxAge < now
  const cacheMaxAge = isImmutable
    ? DEFAULT_CACHE_TTL
    : _calcCacheTtl(fetchTime, now)

  // Set cache on successful request
  _setCacheHeaderOnSuccess(res, cacheMaxAge)

  return next()

  function _floorTimeToMinute(currentTime) {
    return Math.floor(currentTime / ONE_MINUTE_MILLIS) * ONE_MINUTE_MILLIS
  }

  function _calcCacheTtl(dataGatheredAt, currentTime) {
    return Math.floor(
      (dataGatheredAt + ONE_MINUTE_MILLIS - currentTime) / MILLISECOND_MODIFIER
    )
  }
}

/**
 * Set cache time for cloudfront if request is successful.
 * res.end is called by res.send which is called by res.json.
 */
function _setCacheHeaderOnSuccess(res, maxAge) {
  const responseEnd = res.end.bind(res)

  res.end = function (...args) {
    if (res.statusCode === STATUS_CODE_SUCCESS) {
      res.set('Cache-Control', `public, max-age=${maxAge}`)
    }

    return responseEnd(...args)
  }
}
