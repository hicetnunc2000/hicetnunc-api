const serverless = require('serverless-http')
const axios = require('axios')
const IPFS = require('ipfs-api')
const express = require('express')
const cors = require('cors')
const _ = require('lodash')

const ipfs = new IPFS({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
})

const test = async () => console.log(await ipfs.add(Buffer.from(JSON.stringify({oi : 'oi'}))))
//test()
const testnet = {
    objkts: 'KT1XFvSpHLUqtR1wyTwR8GJ2GswFJHfamGvT',
    ledgerPtr: 74453,
    metadataPtr: 74456,
    network: 'delphinet',
    protocol: 'KT1QfY5MgsbFayqSqvn7EJangrUAF4xt4B49',
    swapsPtr: 74465
}

const mainnet = {
    objkts: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
    ledgerPtr: 511,
    metadataPtr: 514,
    network: 'mainnet',
    protocol: 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9',
    swapsPtr: 523,
    hDAO : 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
    curations : 'KT1TybhR7XraG75JFYKSrh7KnxukMBT5dor6',
    curationsPtr : 519,
    royaltiesPtr : 522,
    ledgerPtr2 : 515
}

const getStorage = async (config, kt) => {
    await axios.get(`https://better-call.dev/v1/contract/${config.network}/${kt}/storage`).then(res => console.log(res.data))
}

//getStorage(mainnet, mainnet.curations)

const getSwaps = async (config) => {
    return await axios.get(`https://better-call.dev/v1/bigmap/${config.network}/${config.swapsPtr}/keys?size=2000`).then(res => {
        return (res.data).map(e => {
            var obj = {}
            obj['swap_id'] = e.data.key.value
            e.data.value != null ? e.data.value.children.map(e => obj[e.name] = e.value) : null
            return obj
        })
    })
}
/* .map(e => e.data.value != null ? (e.data.value.children).map(e => { return { key : e.name, value : e.value }} ) : null ))  */

const getObjktLedger = async (config) => {
    return await axios.get(`https://better-call.dev/v1/bigmap/${config.network}/${config.ledgerPtr}/keys?size=2000`).then(res => res.data.map(e => ({ amount: parseInt(e.data.value.value), tz: e.data.key.children[0].value, tk_id: parseInt(e.data.key.children[1].value) })))
}

const getObjktMetadata = async (config) => {
    return await axios.get(`https://better-call.dev/v1/bigmap/${config.network}/${config.metadataPtr}/keys?size=2000`).then(res => res.data.map(e => ({ tk_id: parseInt(e.data.key.value), metadata: e.data.value.children[1].children[0].value.split('//')[1] })))
}

const getObjktLedgerOffset = async (config, offset) => { return await axios.get(`https://better-call.dev/v1/bigmap/${config.network}/${config.metadataPtr}/keys?offset=${offset * 10}`).then(res => res.data.map(e => ({ amount: parseInt(e.data.value.value), tz: e.data.key.children[0].value, tk_id: parseInt(e.data.key.children[1].value) }))) }

const objktById = async (config, id, res) => { 

    var ledger = await getObjktLedger(config)
    var objkt = feed(ledger).filter(e => e.tk_id == id)
    var metadata = await getObjktMetadata(config)
    var swaps = await getSwaps(config)
    var addrs = await owners(id)
    console.log(objkt)
    //objkt = [objkt[0].owners = addrs]
    //console.log('objktId', id, merge(objkt, metadata))
    readMetadata(mergeSwaps(merge(objkt, metadata), swaps), res)
}

// get lower swap prices 

const getFeed = async (config, offset, res) => {

    var ledger = await getObjktLedger(config)
    var metadata = await getObjktMetadata(config)
    var swaps = await getSwaps(config)


    //console.log(mergeSwaps(ledger, swaps))
    //console.log(feed(desc(ledger)))
    //console.log(desc(feed(merge(ledger, metadata))))
    //console.log(merge(ledger, metadata))
    //console.log(ledger)
    //console.log(await updateAmount(ledger))
    //mergePromise(updateAmount(feed(merge(ledger, metadata))))
    //console.log(mergeSwaps(merge(offsetFunction(feed(desc(ledger)), offset), metadata), swaps))
    //mergePromise(updateAmount(merge(offsetFunction(desc(ledger), offset), metadata)))

    readMetadata(mergeSwaps(merge(offsetFunction(feed(desc(ledger)), offset), metadata), swaps), res)

}


/* const mergePromise = async (arg1, arg2) => {

    var promise = Promise.all([arg1.map(e => e), arg2.map(e => e))
    promise.then(results => {
        results.map(e => console.log(e))
    })
} */

const getTzLedger = async (config, tz, res) => {
    var ledger = await getObjktLedger(config)
    var metadata = await getObjktMetadata(config)
    var swaps = await getSwaps(config)

    var filtered = filter(merge(ledger, metadata), tz)
    //updateAmount(filtered)
    readMetadata(mergeSwaps(filtered, swaps), res)

    // profile info

}

const readMetadata = (arr, res) => {

    var arr = arr.map(async e => {
        e.metadata = (JSON.parse(JSON.stringify((await ipfs.files.get(e.metadata))[0].content.toString('utf-8'))))
        return e
    })

    /* resolve promise and dispatch answer */

    var promise = Promise.all(arr.map(e => e))
    promise.then((results) => {
        aux_arr = results.map(e => e)

        aux_arr = aux_arr.map(async e1 => {
            e1.total_amount = 0
            var aux_arr = (await getObjktLedger(mainnet))
            aux_arr.map(e2 => parseInt(e1.tk_id) == parseInt(e2.tk_id) ? e1.total_amount += e2.amount : null)
            return e1
        })

        var internalPromise = Promise.all(aux_arr.map(e => e))
        internalPromise.then((results) => {
            aux_arr2 = results.map(e => e)

            res.json({ result : jsonParse(aux_arr2) })
        })
        //console.log(jsonParse(aux_arr))
        //res.json({ result : jsonParse(aux_arr) })
        //console.log(aux_arr)
        /* feed order */
        //console.log(aux_arr)
//        func != null ? func(desc(aux_arr)) : desc(aux_arr) // treat json metadata

    })

    /* height */

}

const owners = async (id) => {
    const ledger = await getObjktLedger(testnet)
    return ledger.filter(e => e.tk_id == id)
}

const updateAmount = async (arr) => {

    //console.log(arr)

    var arr = arr.map(async e1 => {
        e1.total_amount = 0
        var aux_arr = (await getObjktLedger(testnet))
        aux_arr.map(e2 => e1.tk_id == e2.tk_id ? e1.total_amount += e2.amount : null)
        //console.log(e1)
        return e1
    })

    var aux_arr = []

    var promise = Promise.all(arr.map(e => e))
    promise.then((results) => {
        aux_arr = results.map(e => e)
        console.log(aux_arr)
/*         aux_arr.map(async e => {
            var res = e.metadata.formats[0].mimeType == 'text/plain' ? await axios.get(e.metadata.formats[0].uri).then(res => res.data) : null
            res != null ? e.metadata.text = res : null
            //console.log(e)
        }) */

        //console.log(aux_arr)

    })
}

/* aux functions */

// feed desc order
const desc = arr => _.sortBy(arr, o => o.tk_id).reverse()

// get lower price from swaps

const mergeSwaps = (arr, swaps) => {
    arr.forEach((e1) => {

        e1.swaps = []

        swaps.forEach((e2) => {
            if (parseInt(e1.tk_id) === parseInt(e2.objkt_id)) {
                e1.swaps.push(e2)
            }
        })
    })
    return arr
}

// offset

const offsetFunction = (arr, set) => arr.slice(set * 5, set * 5 + 5)

const jsonParse = arr => arr.map(e => { return { ...e, metadata: JSON.parse(e.metadata) } })

const filter = (data, tz) => _.filter(data, { tz: tz })

const feed = (data) => (_.uniqBy(data, 'tk_id'))

const getText = async (url) => await axios.get(url).then(res => res.data)

const merge = (a, b) => {
    a.forEach((e1) => {
        b.forEach((e2) => {
            if (e1.tk_id === e2.tk_id) {
                _.assign(e1, e2)
            }
        })
    })
    return a
}

//getLedgerPtrs(objkts_testnet, 'delphinet')
//getObjktLedger(testnet)
//getObjktMetadata('delphinet')
//getTzLedger(testnet, 'tz1Zz4MmtM6mpzh5XWiAEXGeP9iWsT7PSmzg')
//getFeed(testnet, 2)
//getObjktLedgerOffset(testnet)
//getSwaps(testnet)
//objktById(mainnet, 154)
//getFeed(mainnet, 0)
//getTzLedger(mainnet, 'tz1UBZUkXpKGhYsP5KtzDNqLLchwF4uHrGjw')

const app = express()

app.use(express.json())
app.use(cors({origin : '*'}))

app.post('/feed', (req, res) => {
    getFeed(mainnet, req.body.counter, res)
})

app.post('/tz', (req, res) => {
    getTzLedger(mainnet, req.body.tz, res)
})

app.post('/objkt', (req, res) => {
    objktById(mainnet, parseInt(req.body.id), res)
})

module.exports.handler = serverless(app)
