const serverless = require('serverless-http')
const axios = require('axios')
const express = require('express')
const cors = require('cors')
const _ = require('lodash')
const conseilUtil = require('./conseilUtil')
const { random } = require('lodash')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')

const BURN_ADDRESS = 'tz1burnburnburnburnburnburnburjAYjjX'

require('dotenv').config()

const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue)

const getIpfsHash = async (ipfsHash) => {
    return await axios.get('https://cloudflare-ipfs.com/ipfs/' + ipfsHash).then(res => res.data)
}


const owners = async (obj) => {
    var owners = await conseilUtil.getObjektOwners(obj.token_id)
    var values_arr = (_.values(owners))
    obj.total_amount = (values_arr.map(e => parseInt(e))).length > 0 ? values_arr.filter(e => parseInt(e) > 0).reduce(reducer) : 0
    obj.owners = owners
    return obj
}

const desc = arr => _.sortBy(arr, e => parseInt(e.objectId)).reverse()
const offset = (arr, set) => arr.slice(set * 30, set * 30 + 30)


const customFloor = function (value, roundTo) {
    return Math.floor(value / roundTo) * roundTo;
}

const ONE_MINUTE_MILLIS = 60 * 1000

const randomFeed = async (counter, res) => {
    var feed = await conseilUtil.getArtisticUniverse(0)
    feed = offset(_.shuffle(feed), counter)
    feed = await feed.map(async e => {
        e.token_info = await getIpfsHash(e.ipfsHash)
        e.token_id = parseInt(e.objectId)
        return e
    })
    var promise = Promise.all(feed.map(e => e))
    promise.then(async (results) => {
        var aux_arr = results.map(e => e)
        res.json({ result: aux_arr })
    })
}

const getFeed = async (res, counter, featured, max_time) => {
    const now_time = Date.now()
    const immutable = (typeof max_time !== 'undefined') && (max_time < now_time)
    max_time = (typeof max_time !== 'undefined') ? max_time : customFloor(now_time, ONE_MINUTE_MILLIS)
    
    console.log(`feed, featured: ${featured}`)
    var arr
    if (featured) {
        arr = await conseilUtil.getFeaturedArtisticUniverse(0, max_time)
    } else {
        arr = await conseilUtil.getArtisticUniverse(0, max_time)
    }

    var feed = offset(desc(arr), counter)
    feed = await feed.map(async e => {
        e.token_info = await getIpfsHash(e.ipfsHash)
        e.token_id = parseInt(e.objectId)
        console.log(e)
        return e
    })
    var cache_time
    if (immutable) {
        cache_time = 60 * 10
    }
    else {
        cache_time = Math.floor(((max_time + ONE_MINUTE_MILLIS) - now_time) / 1000)
    }
    var promise = Promise.all(feed.map(e => e))
    return promise.then(async (results) => {
        var aux_arr = results.map(e => e)
        res.set('Cache-Control', `public, max-age=${cache_time}`)
        res.json({ result: aux_arr })
    })
}

const getTzLedger = async (tz, res) => {
    /*     var ledger = desc(await getObjktLedger())
        var objkts = await getObjkts()
        var tzLedger = _.map(filterTz(ledger, tz), (obj) => _.assign(obj, _.find(objkts, { token_id : obj.tk_id })))
     */
    var collection = await conseilUtil.getCollectionForAddress(tz)
    var creations = await conseilUtil.getArtisticOutputForAddress(tz)
    var hdao = await conseilUtil.gethDaoBalanceForAddress(tz)

    console.log(hdao)

    var validCreations = []

    await Promise.all(creations.map(async (c) => {
        c.token_id = c.objectId

        await owners(c)

        var burnAddrCount = c.owners[BURN_ADDRESS]
        var allIssuesBurned = burnAddrCount && burnAddrCount === c.total_amount

        if (!allIssuesBurned) {
            delete c.owners

            validCreations.push(c)
        }

        return arr
    }))

    validCreations = validCreations.sort((a, b) => parseInt(b.objectId) - parseInt(a.objectId))

    var arr = []
    console.log([...collection, ...validCreations])
    var arr = [...collection, ...validCreations]

    var result = arr.map(async e => {
        e.token_info = await getIpfsHash(e.ipfsHash)

        if (e.piece != undefined) {
            e.token_id = parseInt(e.piece)
        } else {
            e.token_id = parseInt(e.objectId)

        }
        console.log(e)
        return e
    })

    var promise = Promise.all(result.map(e => e))
    promise.then(async results => {
        var result = results.map(e => e)
        console.log(result)

        res.json({
            result: _.uniqBy(result, (e) => {
                return e.token_id
            }),
            hdao: hdao
        })
    })
}

const getObjktById = async (id, res) => {
    var objkt = await conseilUtil.getObjectById(id)
    objkt.token_id = objkt.objectId
    objkt = await owners(objkt)
    objkt.token_info = await getIpfsHash(objkt.ipfsHash)
    console.log(objkt)

    return objkt
}

const mergehDAO = async (obj) => {
    var obj_aux = await getObjktById(obj.token_id)
    obj_aux.hDAO_balance = obj.hDAO_balance
    return obj_aux
}

const hDAOFeed = async (counter, res) => {

    var hDAO = await conseilUtil.hDAOFeed()
    var set = _.orderBy(hDAO, ['hDAO_balance'], ['desc'])
    var objkts = await (offset(set, counter)).map(async e => await mergehDAO(e))

    var promise = Promise.all(objkts.map(e => e))
    promise.then(results => {
        var result = results.map(e => e)
        console.log(result)
        res.set('Cache-Control', `public, max-age=300`)
        res.json({ result: result })
    }).catch(e => {
        res.status(500).json({ error: 'downstream API failure' })
    })
}

// list of restricted addresses
const getRestrictedAddresses = async () => {
    const list = await axios.get('https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/w.json').then(res => res.data)
    return list
}

// list of restricted objkts
const getRestrictedObjkts = async () => {
    const list = await axios.get('https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/o.json').then(res => res.data)
    return list
}

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))

const feedfeatured = async(req, res) => {
    const feedOffset = req.body.counter || 0
    const isFeatured = req.path === '/featured'

    await getFeed(res, feedOffset, isFeatured, req.body.max_time)
}

app.post('/feed|/featured', async (req, res) => {
    /*  #swagger.start
        #wagger.auto = false
        #swagger.path = '/feed/{featured}'
        #swagger.method = 'post'
        #swagger.summary = 'Main feed'
        #swagger.description = 'Endpoint used to return the most recently minted OBJKTs.
            Data is returned 30 at a time, and can be paginated. Total results are limited to 2500.
            Use of the optional `featured` path parameter will apply a different filter to the
            feed.'
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
        #swagger.responses[200] = {
            schema: {
                "result": [
                    { $ref: "#/definitions/objkt" }
                ]
            }
        }
        #swagger.end
    */
    await feedfeatured(req, res)
})

app.get('/feed|/featured', async (req, res) => {
    await feedfeatured(req, res)
})


// Random

app.post('/random', async (req, res) => {
    /* #swagger.summary = 'Random OBJKTs'
       #swagger.description = 'Endpoint used to return an array of a random set of OBJKTs.'
    */
    res.set('Cache-Control', `public, max-age=300`)
    await randomFeed(parseInt(req.body.counter), res)
})

app.get('/random', async (req, res) => {
    res.set('Cache-Control', `public, max-age=300`)
    await randomFeed(parseInt(req.query.counter), res)
})


// TZ

const get_tz = async(tz, res) => {
    // list of restricted addresses
    var list = await getRestrictedAddresses()
    res.set('Cache-Control', `public, max-age=120`)
    list.includes(tz)
        ?
        res.json({ result: [] })
        :
        await getTzLedger(tz, res)
}

app.post('/tz', async (req, res) => {
    await get_tz(req.body.tz, res)
})
app.get('/tz', async (req, res) => {
    await get_tz(req.query.tz, res)
})

// OBJEKT

const objkt = async(id, res) => {

    // list of restricted objkts
    var list = await getRestrictedObjkts()

    res.set('Cache-Control', `public, max-age=120`)
    list.includes(parseInt(id))
        ?
        res.json({ result: [] })
        :
        res.json({ result: await getObjktById(id) })
}

app.post('/objkt', async (req, res) => {
    /* #swagger.summary = 'OBJKT details'
       #swagger.description = 'Endpoint used to return information about an OBJKT.'
    */
    await objkt(req.body.objkt_id, res)

})
app.get('/objkt', async (req, res) => {
    await objkt(req.query.id, res)
})




app.get('/recommend_curate', async (req, res) => {
    const amt = await conseilUtil.getRecommendedCurateDefault()
    res.set('Cache-Control', `public, max-age=300`)
    res.json({ amount: amt })
})


// HDAO
app.post('/hdao', async (req, res) => {
    await hDAOFeed(parseInt(req.body.counter), res)
})

app.get('/hdao', async (req, res) => {
    await hDAOFeed(parseInt(req.query.counter), res)
})

//generate swagger docs endpoint
app.use(express.json())
var swaggerOptions = {
    explorer: true,
    defaultModelsExpandDepth: -1,
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css',
    customCss: '.swagger-ui .topbar { display: none } '
  };
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile, swaggerOptions))

//app.listen(3001)
console.log('SERVER RUNNING ON localhost:3001')
console.log('API documentation: http://localhost:3001/doc')
module.exports.handler = serverless(app)

