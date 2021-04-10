const serverless = require('serverless-http')
const axios = require('axios')
const express = require('express')
const cors = require('cors')
const _ = require('lodash')
const conseilUtil = require('./conseilUtil')
const { random } = require('lodash')

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

    res.set('Cache-Control', `public, max-age=300`)
    var promise = Promise.all(objkts.map(e => e))
    promise.then(results => {
        var result = results.map(e => e)
        console.log(result)
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
    await feedfeatured(req, res)
})

app.get('/feed|/featured', async (req, res) => {
    await feedfeatured(req, res)
})


// Random

const rand = async(req, res) => {
    res.set('Cache-Control', `public, max-age=300`)
    await randomFeed(parseInt(req.body.counter), res)
}

app.post('/random', async (req, res) => {
    await rand(req, res)
})

app.get('/random', async (req, res) => {
    await rand(req, res)
})


// TZ

const tz = async(req, res) => {
    // list of restricted addresses
    var list = await getRestrictedAddresses()

    res.set('Cache-Control', `public, max-age=120`)
    list.includes(req.body.tz)
        ?
        res.json({ result: [] })
        :
        await getTzLedger(req.body.tz, res)
}

app.post('/tz', async (req, res) => {
    await tz(req, res)
})
app.get('/tz', async (req, res) => {
    await tz(req, res)
})

// OBJEKT

const objkt = async(req, res) => {

    // list of restricted objkts
    var list = await getRestrictedObjkts()

    res.set('Cache-Control', `public, max-age=120`)
    list.includes(parseInt(req.body.objkt_id))
        ?
        res.json({ result: [] })
        :
        res.json({ result: await getObjktById(req.body.objkt_id) })
}

app.post('/objkt', async (req, res) => {
    await objkt(req, res)

})
app.get('/objkt', async (req, res) => {
    await objkt(req, res)
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
    await hDAOFeed(parseInt(req.body.counter), res)
})

//app.listen(3001)
console.log('SERVER RUNNING ON localhost:3001')
module.exports.handler = serverless(app)

