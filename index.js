const serverless = require('serverless-http')
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const conseilUtil = require('./conseilUtil')
const _ = require('lodash')
const MongoClient = require('mongodb').MongoClient
const { CryptonomicNameServiceHelper } = require('conseiljs')

//require('dotenv').config()

const app = express()
const dev = "https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens"
const client = new MongoClient(url);

const insertFeed = async () => {
    await client.connect()
    const database = client.db('OBJKTs-DB')
    const objkts = database.collection('metadata')
    //await objkts.createIndex( { 'token_id' : 1 }, { unique: true } )
    await getFeed([], 0, objkts)
}

const getFeed = async (arr, counter, objkts) => {
    let res = await axios.get("https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens?offset=" + counter).then(res => res.data)
    //console.log(res)
/*     res = res.map(e => {
        e._id = e.token_id
        return e
    })
    let difference = res.filter(e => !arr.includes(e)) */
    res.map(async e => {
        try {
            console.log(e.token_id)
            await objkts.insertOne(e)
        } catch (e) {
            console.log('unique')
            // counter for failed attempts/break
        }
    })
    if (res.length < 10) return [arr, ...res]
    return await getFeed(arr, counter + 10, objkts)
}

const getTag = async (req, res) => {
    await client.connect()
    const database = client.db('OBJKTs-DB')
    const objkts = database.collection('metadata')
    let r = await objkts.find({ tags : { $all : [ req.body.tag ]}})
    res.json({
        result : await r.toArray()
    })
}

const getObjkt = async (req, res) => {
    await client.connect()
    const database = client.db('OBJKTs-DB')
    const objkts = database.collection('metadata')
    let r = await objkts.find({ token_id : req.body.token_id })
    res.json({
        result : await r.toArray()
    })
}
//getTag('GAN')
insertFeed()

//const client = new MongoClient(uri)

const getIpfsHash = async (ipfsHash) => {
    return await axios.get('https://cloudflare-ipfs.com/ipfs/' + ipfsHash).then(res => res.data)
}

app.use(express.json())
app.use(cors({ origin: '*' }))

const desc = arr => _.sortBy(arr, e => parseInt(e.objectId)).reverse()
const offset = (arr, set) => arr.slice(set * 200, set * 200 + 200)

const test = () => console.log('test')

const insertTest = async () => {

    // db connection

    await client.connect()
    const database = client.db('OBJKTs-DB')
    const objkts = database.collection('metadata')

    let counter = 0

    let arr = await conseilUtil.getArtisticUniverse(0)
    let feed = offset(desc(arr), counter)

    while (feed.length == 200) {
        console.log(feed.length)
        counter += 1

        // get ipfs content

        var res = await feed.map(async e => {
            e.token_info = await getIpfsHash(e.ipfsHash)
            e.token_id = parseInt(e.objectId)

            // sanitize object

            delete e.objectId
            delete e.minter
            delete e.swaps
            return e
        })

        var promise = Promise.all(res.map(e => e))
        promise.then(async results => {
            var result = results.map(e => e)
            await objkts.insertMany(result)
        })

        let arr = await conseilUtil.getArtisticUniverse(0)
        feed = offset(desc(arr), counter)

    }


    console.log('ops')
}
//getFeed()
//insertTest()
//const result = await objkts.insertMany(feed);
//console.log(result)\

app.use(express.json())
app.use(cors({ origin: '*' }))

app.post('/', async (req, res) => {
    res.json({ result: [] })
})

app.post('/update_feed', async (req, res) => {
    // res.json({})
    await insertFeed(req, res)
})

app.post('/tag', async (req, res) => {
    await getTag(req, res)
})

app.post('/objkt', async (req, res) => {
    await getObjkt(req, res)
})

// regex route for titles and descriptions

//app.listen(3002)
//module.exports.handler = serverless(app)

