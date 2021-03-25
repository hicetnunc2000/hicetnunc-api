const serverless = require('serverless-http')
const axios = require('axios')
const express = require('express')
const cors = require('cors')
const _ = require('lodash')
const conseilUtil = require('./conseilUtil')
const { random } = require('lodash')
require('dotenv').config()

const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue)

const getIpfsHash = async (ipfsHash) => {

    return await axios.get('https://cloudflare-ipfs.com/ipfs/' + ipfsHash).then(res => res.data)
    /*    const nftDetailJson = await nftDetails.json();
   
       const nftName = nftDetailJson.name;
       const nftDescription = nftDetailJson.description;
       const nftCreators = nftDetailJson.creators.join(', ');
       const nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
       const nftArtifactType = nftDetailJson.formats[0].mimeType.toString();
   
       return { name: nftName, description: nftDescription, creators: nftCreators, artifactUrl: nftArtifact, artifactType: nftArtifactType }; */
}
const getObjkts = async () => {
    return await axios.get(`https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens`).then(res => res.data)
}

const getTokenHolders = async (tk_id) => {
    return await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + tk_id).then(res => res.data)
}

const getTokenHoldersArr = async (arr) => {

    return await arr.map(async e => await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + e).then(res => res.data))
    /*     await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + arr[0]).then(res => console.log(res.data))
     *//*     var result = arr.map(async e => {
return await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + e).then(res => res.data)
})
 
console.log(result) */
}

const owners = async (obj) => {
    var owners = await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + obj.token_id).then(res => res.data)
    var values_arr = (_.values(owners))
    obj.total_amount = (values_arr.map(e => parseInt(e))).length > 0 ? values_arr.filter(e => parseInt(e) > 0).reduce(reducer) : 0
    obj.owners = owners
    console.log(obj)
    //obj.total_amount = (values_arr.map(e => parseInt(e))).reduce(reducer)
    return obj
}

const totalAmountIntegral = async (obj) => {
    var owners = await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + obj.token_id).then(res => res.data)
    console.log(owners)
    var values_arr = (_.values(owners))
    obj.total_amount = (values_arr.map(e => parseInt(e))).length > 0 ? (values_arr.filter(e => parseInt(e))) : 0

    obj.owners = owners
    return obj
}

const objktAmount = async (arr) => {
    return await arr.map(e => totalAmountIntegral(e))
    //console.log(await getTokenHoldersArr(arr.map(e => _.values(e.token_id)[0])))
}

const objktOwners = async (arr) => {
    return await arr.map(e => totalAmountIntegral(e))
}


const getObjktLedger = async () => await axios.get('https://better-call.dev/v1/bigmap/mainnet/511/keys?size=6500').then(res => res.data.map(e => ({ amount: parseInt(e.data.value.value), tz: e.data.key.children[0].value, tk_id: parseInt(e.data.key.children[1].value) })))
const gethDAOLedger = async (counter) => await axios.get('https://api.better-call.dev/v1/bigmap/mainnet/519/keys?size=10&offset=' + counter * 10).then(res => res.data.map(e => {
    return { token_id: parseInt(e.data.key.value), hDAO_balance: parseInt(e.data.value.children[0].value) }
}))

//gethDAOLedger()


const getSwaps = async () => {
    return await axios.get(`https://api.better-call.dev/v1/bigmap/mainnet/523/keys?size=6000`).then(res => {
        return (res.data).map(e => {
            var obj = {}

            obj['swap_id'] = e.data.key.value
            e.data.value != null ? e.data.value.children.map(e => obj[e.name] = e.value) : null
            return obj
        })
    })
}

const merge = (a, b) => {
    a.forEach((e1) => {
        b.forEach((e2) => {
            if (e1.token_id === e2.tk_id) {
                _.assign(e1, e2)
            }
        })
    })
    return a
}

const mergeSwaps = (arr, swaps) => {
    arr.forEach((e1) => {

        e1.swaps = []

        swaps.forEach((e2) => {
            if (parseInt(e1.token_id) === parseInt(e2.objkt_id)) {
                e1.swaps.push(e2)
            }
        })
    })
    return arr
}

const desc = arr => _.sortBy(arr, e => parseInt(e.objectId)).reverse()
const offset = (arr, set) => arr.slice(set * 30, set * 30 + 30)

const filter = (data, tz) => _.filter(data, (e) => {
    if (e.token_info != undefined) {
        return e.token_info.creators[0] === tz
    }
})

const filterTz = (data, tz) => _.filter(data, { tz: tz })

const test = async () => console.log(desc(await getObjkts()))

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
        console.log(e)
        return e
    })
    var promise = Promise.all(feed.map(e => e))
    promise.then(async (results) => {
        var aux_arr = results.map(e => e)
        //res.set('Cache-Control', `public, max-age=${cache_time}`)
        console.log(aux_arr)
        res.json({ result: aux_arr })
    })
}

const getFeed = async (counter, res) => {

    /*     const now_time = Date.now()
        const immutable = (typeof max_time !== 'undefined') && (max_time < now_time)
        max_time = (typeof max_time !== 'undefined') ? max_time : customFloor(now_time, ONE_MINUTE_MILLIS)
     */
    var arr = await conseilUtil.getArtisticUniverse(0)

    var feed = offset(desc(arr), counter)
    console.log(feed)
    feed = await feed.map(async e => {
        e.token_info = await getIpfsHash(e.ipfsHash)
        e.token_id = parseInt(e.objectId)
        console.log(e)
        return e
    })
    //console.log(feed)
    /*    var cache_time
       if (immutable) {
           cache_time = 60 * 10
       }
       else {
           cache_time = (int)(((max_time + ONE_MINUTE_MILLIS) - now_time) / 1000)
       } */
    var promise = Promise.all(feed.map(e => e))
    promise.then(async (results) => {
        var aux_arr = results.map(e => e)

        //res.set('Cache-Control', `public, max-age=${cache_time}`)

        console.log(aux_arr)
        res.json({ result: aux_arr })
    })
}

const filterObjkts = (arr, id_arr) => _.filter(arr, { token_id: tk.id })

const getTzLedger = async (tz, res) => {
    /*     var ledger = desc(await getObjktLedger())
        var objkts = await getObjkts()
        var tzLedger = _.map(filterTz(ledger, tz), (obj) => _.assign(obj, _.find(objkts, { token_id : obj.tk_id })))
     */
    var collection = await conseilUtil.getCollectionForAddress(tz)
    var creations = await conseilUtil.getArtisticOutputForAddress(tz)
    var hdao = await conseilUtil.gethDaoBalanceForAddress(tz)

    console.log(hdao)

    var arr = []
    console.log([...collection, ...creations])
    var arr = [...collection, ...creations]

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

    //return tzLedger
}

const getObjktById = async (id, res) => {
    var objkt = await conseilUtil.getObjectById(id)
    objkt.token_id = objkt.objectId
    objkt = await owners(objkt)
    objkt.token_info = await getIpfsHash(objkt.ipfsHash)
    console.log(objkt)

    return objkt
    //res.json({ result : objkt })
    //var objkts = await getObjkts()
    //var swaps = await getSwaps()
    //res.json({ result : mergeSwaps([objkt], swaps)[0] })
    //console.log(_.filter(mergeSwaps(objkts, swaps), {token_id : id}))
    //   var arr = await objktOwners(_.filter(mergeSwaps(objkts, swaps), {token_id : id}))
    //   var promise = Promise.all(arr.map(e => e))

    /*     promise.then((results) => {
            var aux_arr = results.map(e => e)
            console.log(aux_arr)
            res.json({ result : aux_arr })
        }) */
    //https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=842
}

const mergehDAO = async (obj) => {
    var obj_aux = await getObjktById(obj.token_id)
    obj_aux.hDAO_balance = obj.hDAO_balance
    return obj_aux
}

const hDAOFeed = async (counter, res) => {

    var hDAO = await conseilUtil.hDAOFeed()
    var set = _.orderBy(hDAO, ['hDAO_balance'], ['desc'])
    var objkts = await (offset(set, 0)).map(async e => await mergehDAO(e))

    var promise = Promise.all(objkts.map(e => e))
    promise.then(results => {
        var result = results.map(e => e)
        console.log(result)
        res.json({ result: result })
    }).catch(e => {
        res.status(500).json({ error: 'downstream API failure' })
    })
}

//getObjkts()
//testSwaps()
//getFeed(0)
//getTzLedger('tz1UBZUkXpKGhYsP5KtzDNqLLchwF4uHrGjw')
//getObjktById(5965)
//const test2 = async () => console.log(await getObjktLedger())
//test2()

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))

app.post('/feed', async (req, res) => {
    /*     
        var counter = req.query.counter
        var max_time = req.query.hasOwnProperty('time') ? customFloor(req.query.time, ONE_MINUTE_MILLIS) : null
        const now_time_qt = customFloor(Date.now(), ONE_MINUTE_MILLIS)
        if (max_time != null & max_time > now_time_qt) {
            max_time = null
        } 
    */
    await getFeed(req.body.counter, res)
})

app.post('/random', async (req, res) => {
    await randomFeed(parseInt(req.body.counter), res)
})

app.post('/tz', async (req, res) => {

    // list of restricted addresses
    var list = await axios.get('https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/w.json').then(res => res.data)

    list.includes(req.body.tz)
        ?
        res.json({ result: [] })
        :
        await getTzLedger(req.body.tz, res)

})

app.post('/objkt', async (req, res) => {

    // list of restricted objkts
    var list = await axios.get('https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/o.json').then(res => res.data)

    list.includes(parseInt(req.body.objkt_id))
        ?
        res.json({ result: [] })
        :
        res.json({ result: await getObjktById(req.body.objkt_id) })
})

app.post('/hdao', async (req, res) => {
    await hDAOFeed(parseInt(req.body.counter), res)
})

const testhdao = async () =>  await hDAOFeed(parseInt(0))
//testhdao()

app.listen(3001)
//module.exports.handler = serverless(app)

