const serverless = require('serverless-http')
const axios = require('axios')
const express = require('express')
const cors = require('cors')
const _ = require('lodash')

const conseilUtil = require('./conseilUtil')

const reducer = (accumulator, currentValue) => accumulator + currentValue;

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

const totalAmount = async (obj) => {
    var owners = await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + obj.token_id).then(res => res.data)
    var values_arr = (_.values(owners))
    obj.total_amount = (values_arr.map(e => parseInt(e))).reduce(reducer)
    return obj
}

const totalAmountIntegral = async (obj) => {
    var owners = await axios.get('https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' + obj.token_id).then(res => res.data)
    console.log(owners)
    var values_arr = (_.values(owners))
    obj.total_amount = (values_arr.map(e => parseInt(e))).reduce(reducer)
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

const getSwaps = async () => {
    return await axios.get(`https://api.better-call.dev/v1/bigmap/mainnet/523/keys?size=5000`).then(res => {
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

const desc = arr => _.sortBy(arr, e => parseInt(e.token_id)).reverse()
const offset = (arr, set) => arr.slice(set * 10, set * 10 + 10)

const filter = (data, tz) => _.filter(data, (e) => {
    if (e.token_info != undefined) {
    return e.token_info.creators[0] === tz
    }
})

const filterTz = (data, tz) => _.filter(data, { tz : tz })

const test = async () => console.log(desc(await getObjkts()))
 
const getFeed = async (counter, res) => {
    var feed = offset(desc(await getObjkts()), counter)
    var swaps = await getSwaps()
    var arr = await objktAmount(mergeSwaps(feed, swaps))
    var promise = Promise.all(arr.map(e => e))
    
    promise.then((results) => {
        var aux_arr = results.map(e => e)
        res.json({ result : aux_arr })
    })
}

const filterObjkts = (arr, id_arr) => _.filter(arr, { token_id : tk.id })
//console.log(_.find(ledger, { tz : 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9'}))

const getTzLedger = async (tz) => {
    var ledger = desc(await getObjktLedger())
    var objkts = await getObjkts()
    var tzLedger = _.map(filterTz(ledger, tz), (obj) => _.assign(obj, _.find(objkts, { token_id : obj.tk_id })))

    //conseilUtil.getCollectionForAddress(tz);
    //conseilUtil.getArtisticOutputForAddress(tz);

    return tzLedger
}

const getObjktById = async (id, res) => {
    var objkts = await getObjkts()
    var swaps = await getSwaps()
    //console.log(_.filter(mergeSwaps(objkts, swaps), {token_id : id}))
    var arr = await objktOwners(_.filter(mergeSwaps(objkts, swaps), {token_id : id}))
    var promise = Promise.all(arr.map(e => e))
    
    promise.then((results) => {
        var aux_arr = results.map(e => e)
        console.log(aux_arr)
        res.json({ result : aux_arr })
    })
    //https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=842
}

//getObjkts()
//testSwaps()
//getFeed(0)
//getTzLedger('tz1UBZUkXpKGhYsP5KtzDNqLLchwF4uHrGjw')

//const test2 = async () => console.log(await getObjktLedger())
//test2()

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))

app.post('/feed', async (req, res) => {
    await getFeed(req.body.counter, res)
})

app.post('/tz', async (req, res) => {
    console.log(req.body.tz)
    res.json({ result : await getTzLedger(req.body.tz) }) 
})

app.post('/objkt', async (req, res) => {
    await getObjktById(parseInt(req.body.objkt_id), res)
})

//app.listen(3001)
module.exports.handler = serverless(app)

//testTkHolder([{'kt' : 2020}, {'kt' : 2021}])
//getFeed(1)
//getObjktById(2000)
