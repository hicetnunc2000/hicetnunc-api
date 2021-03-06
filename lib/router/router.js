'use strict'

const router = require('express').Router()
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger-output.json');
const readFeed = require('./readFeed')
const readRandomFeed = require('./readRandomFeed')
const readIssuer = require('./readIssuer')
const readObjkt = require('./readObjkt')
const readHdaoFeed = require('./readHdaoFeed')
const readRecommendCurate = require('./readRecommendCurate')

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
}

router
  .route('/feed|/featured')
  .all(_processClientCache)
  .get((req, res, next) => {
        /*  
        #swagger.start
        #swagger.path = '/feed/{featured}'
        #swagger.method = 'get'
        #swagger.summary = 'Main feed'
        #swagger.description = 'Endpoint used to return the most recently minted OBJKTs. Data is returned 30 at a time, and can be paginated. Total results are limited to 2500. Use of the optional `featured` path parameter will apply a different filter to the feed.'
        #swagger.parameters['featured'] = {
            in: 'path',
            type: 'string',
            description: 'Applies a filter to the results - returning no more than 1 item per minter,
                including only those swapped for less than 0.1 tez and that haven\'t been updated with
                lots of hDAO.',
            required: false,
            schema: 'featured'
        }
        #swagger.parameters['counter'] = {
            in: 'querystring',
            description: 'Pagination number. Default is 0',
            required: false,
            type: 'number',
            schema: { "counter": 0 }
        }
        #swagger.parameters['max_time'] = {
            in: 'querystring',
            description: 'Unix timestamp. Used to limit the maximum blockchain operation by date/time',
            required: false,
            type: 'number',
            schema: { "max_time": 1618585403788 }
        }
        #swagger.responses[200] = {
            schema: {
                "result": [
                    { $ref: "#/definitions/objkt" }
                ]
            }
        }
        #swagger.end
    */

    req.body.max_time = req.query.max_time
    req.body.counter = req.query.counter

    return next()
  }, _asyncHandler(readFeed))
  .post(_asyncHandler(readFeed), () => {
    /*  
        #swagger.start
        #swagger.path = '/feed/{featured}'
        #swagger.method = 'post'
        #swagger.summary = 'Main feed'
        #swagger.description = 'Endpoint used to return the most recently minted OBJKTs. Data is returned 30 at a time, and can be paginated. Total results are limited to 2500. Use of the optional `featured` path parameter will apply a different filter to the feed.'
        #swagger.parameters['featured'] = {
            in: 'path',
            type: 'string',
            description: 'Applies a filter to the results - returning no more than 1 item per minter,
                including only those swapped for less than 0.1 tez and that haven\'t been updated with
                lots of hDAO.',
            required: false,
            schema: 'featured'
        }
        #swagger.parameters['counter'] = {
            in: 'body',
            description: 'Pagination number. Default is 0',
            required: false,
            type: 'number',
            schema: { "counter": 0 }
        }
        #swagger.parameters['max_time'] = {
            in: 'body',
            description: 'Unix epoch timestamp. Used to limit the maximum blockchain operation by date/time',
            required: false,
            type: 'number',
            schema: { "max_time": 1618585403788 }
        }
        #swagger.responses[200] = {
            schema: {
                "result": [
                    { $ref: "#/definitions/objkt" }
                ]
            }
        }
        #swagger.end    */
  })

router
  .route('/random')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.random)

    return next()
  })
  .get((req, res, next) => {
    /* #swagger.summary = 'Random OBJKTs'
       #swagger.description = 'Endpoint used to return an array of a random set of OBJKTs.'
    */

    req.body.counter = req.query.counter
    return next()
  }, _asyncHandler(readRandomFeed))
  .post(_asyncHandler(readRandomFeed), () => {
    /* #swagger.summary = 'Random OBJKTs'
       #swagger.description = 'Endpoint used to return an array of a random set of OBJKTs.'
    */
  })

router
  .route('/tz')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.issuer)

    return next()
  })
  .get((req, res, next) => {
    /* #swagger.summary = 'Account information'
       #swagger.description = 'Endpoint used to return information about a wallet address. This
       includes the OBJKTs that wallet created, those that it holds, and the amount of hDAO it
       holds. Data is returned 30 at a time, and can be paginated. Total results are limited to 2500.'
    */
    req.body.tz = req.query.tz

    return next()
  }, _asyncHandler(readIssuer))
  .post(_asyncHandler(readIssuer), () => {
    /* #swagger.summary = 'Account information'
       #swagger.description = 'Endpoint used to return information about a wallet address. This
       includes the OBJKTs that wallet created, those that it holds, and the amount of hDAO it
       holds. Data is returned 30 at a time, and can be paginated. Total results are limited to 2500.'
    */
  })

router
  .route('/objkt')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.objkt)

    return next()
  })
  .get((req, res, next) => {
    /* #swagger.summary = 'OBJKT details'
       #swagger.description = 'Endpoint used to return detailed information about an OBJKT.'
    */
    req.body.objkt_id = req.query.id

    return next()
  }, _asyncHandler(readObjkt))
  .post(_asyncHandler(readObjkt), () => {
    /* #swagger.summary = 'OBJKT details'
       #swagger.description = 'Endpoint used to return detailed information about an OBJKT.'
    */
  })

router
  .route('/hdao')
  .all((req, res, next) => {
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.hdao)

    return next()
  })
  .get((req, res, next) => {
    /*  #swagger.summary = 'hDAO feed'
        #swagger.description = 'Endpoint used to return the list of OBJKTs with hDAO in descending
        order of how many hDAO have been spend on them. Data is returned 30 at a time, and can be
        paginated. Total results are limited to 30000.'
        #swagger.parameters['counter'] = {
          in: 'querystring',
          description: 'Results page count (default 0)',
          type: 'number',
          required: false
        }
       */
    req.body.counter = req.query.counter

    return next()
  }, _asyncHandler(readHdaoFeed))
  .post((req, res, next) => {
    /*  #swagger.summary = 'hDAO feed'
        #swagger.description = 'Endpoint used to return the list of OBJKTs with hDAO in descending
        order of how many hDAO have been spend on them. Data is returned 30 at a time, and can be
        paginated. Total results are limited to 30000.'
        #swagger.parameters['counter'] = {
          in: 'body',
          description: 'Results page count (default 0)',
          type: 'number',
          required: false,
          schema: { "counter": 0 }
        }
    */

    return next()
  }, _asyncHandler(readHdaoFeed))

router.get(
  '/recommend_curate',
  (req, res, next) => {
    /* #swagger.summary = 'hDAO minimum spend recommendation'
       #swagger.description = 'Endpoint determines the current swap prices between these currency pairs
        (USD:hDAO, XTZ:hDAO), and it calculates the hDAO value of them. This value is returned if larger
        than 0.1 hDAO, else 0.1 is returned. This data is cached for 300s.
    */    
    _setCacheHeaderOnSuccess(res, CACHE_MAX_AGE_MAP.recommendCurate)

    return next()
  },
  _asyncHandler(readRecommendCurate)
)

// Swagger docs router
var swaggerOptions = {
  explorer: true,
  defaultModelsExpandDepth: -1,
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css',
  customCss: '.swagger-ui .topbar { display: none } '
};
router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument, swaggerOptions) /* #swagger.ignore = true */ ) 

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
