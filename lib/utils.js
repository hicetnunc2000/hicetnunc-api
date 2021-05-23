'use strict'

const axios = require('axios')
const conseil = require('./conseil')
const _ = require('lodash')

const { feedItemsPerPage } = require('./config')

module.exports = {
  getIpfsHash,
  getObjktById,
  getObjktOwners,
  getRestrictedAddresses,
  getRestrictedObjkts,
  paginateFeed,
  sortFeed,
  getObjektByIdBCD,
}

async function getIpfsHash(ipfsHash) {
  return (await axios.get('https://cloudflare-ipfs.com/ipfs/' + ipfsHash)).data
}


//Maintain this map if you don't want objekt queries to take a shit-ton of time
const _block_levels = {
  "0": 1365242,
  "1000": 1372553,
  "2000": 1375633,
  "3000": 1377717,
  "4000": 1379648,
  "5000": 1382041,
  "6000": 1384721,
  "7000": 1388547,
  "8000": 1390594,
  "9000": 1393010,
  "10000": 1394970,
  "11000": 1396760,
  "12000": 1398667,
  "13000": 1400470,
  "14000": 1401962,
  "15000": 1403406,
  "16000": 1404892,
  "17000": 1406495,
  "18000": 1407853,
  "19000": 1409213,
  "20000": 1410465,
  "21000": 1411763,
  "22000": 1413317,
  "23000": 1414740,
  "24000": 1416229,
  "25000": 1417775,
  "26000": 1419345,
  "27000": 1420800,
  "28000": 1422176,
  "29000": 1423576,
  "30000": 1424923,
  "31000": 1426276,
  "32000": 1427562,
  "33000": 1428886,
  "34000": 1430094,
  "35000": 1431211,
  "36000": 1432197,
  "37000": 1433459,
  "38000": 1434792,
  "39000": 1436072,
  "40000": 1437412,
  "41000": 1438318,
  "42000": 1439212,
  "43000": 1440202,
  "44000": 1440814,
  "45000": 1441702,
  "46000": 1442582,
  "47000": 1443245,
  "48000": 1444101,
  "49000": 1444784,
  "50000": 1445717,
  "51000": 1446437,
  "52000": 1447444,
  "53000": 1448401,
  "54000": 1449172,
  "55000": 1450216,
  "56000": 1451043,
  "57000": 1451899,
  "58000": 1453002
}


async function getObjektByIdBCD(id) {
  let url = `https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens?token_id=${id}`
  const bcdData = await axios.get(url)
  let objData = bcdData.data[0]
  let _ipfsHash = Object.values(objData.extras)[0]
  let objkt = {
    token_id: id,
    ipfsHash: _ipfsHash.replace('ipfs://', '')
  }
  const [objktOwners, ipfsMetadata] = await Promise.all([
    getObjktOwners(objkt),
    getIpfsHash(objkt.ipfsHash),
  ])
  
  let creators = await getRealIssuer(objkt.token_id);

  Object.assign(objkt, objktOwners, {
    token_info: Object.assign({}, ipfsMetadata, {
      creators: creators,
    }),
    swaps: []
  })
  return objkt
  
}

async function getObjktById(id, with_swaps=true) {
  const id_int = (typeof id == 'string') ? parseInt(id) : id
  let block_range = Math.floor(id_int / 1000)
  let block_start = _block_levels[Math.max(Math.min(block_range * 1000, 38_000), 0)]
  let block_end = (block_range <= 38) ? _block_levels[Math.min((block_range + 1) * 1000, 39000)] : null

  try {
    const objkt = await conseil.getObjectById(id, with_swaps=with_swaps, block_start, block_end).catch(() => {})
    objkt.token_id = objkt.objectId
    const [objktOwners, ipfsMetadata, hdBalance] = await Promise.all([
      getObjktOwners(objkt),
      getIpfsHash(objkt.ipfsHash),
      conseil.getObjkthDAOBalance(objkt.token_id).catch(() => -1)
    ])

    let creators = await getRealIssuer(objkt.token_id);

    Object.assign(objkt, objktOwners, {
      token_info: Object.assign({}, ipfsMetadata, {
        creators: creators,
      }),
      hDAO_balance: hdBalance
    })

    return objkt
  }
  catch {
    return {}
  }

}

async function getRealIssuer (id) {
  try {
    const apiUrl = `https://api.tzstats.com/explorer/bigmap/522/${id}`
    const result = await axios.get(apiUrl)
    if (result.data) {
      const issuer = result.data.value.issuer
      return [ issuer ];
    } else {
      throw new Error('No creator found for ' + id)
    }
  } catch (err) {
    throw err;
  }
}

async function getObjktOwners(objkt) {
  const owners = (
    await axios.get(
      'https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' +
        objkt.token_id
    )
  ).data

  const ownerCountList = _.values(owners)

  let total = 0

  if (ownerCountList.length) {
    total = ownerCountList.reduce((acc, i) => {
      const owned = parseInt(i)

      return owned > 0 ? acc + owned : acc
    }, 0)
  }

  return {
    total_amount: total,
    owners,
  }
}

async function getRestrictedAddresses() {
  return (
    await axios.get(
      'https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/w.json'
    )
  ).data
}

async function getRestrictedObjkts() {
  return (
    await axios.get(
      'https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/o.json'
    )
  ).data
}


function paginateFeed(feed, cursor) {
  const pageCursor = cursor ? parseInt(cursor) : 0

  return feed.slice(
    pageCursor * feedItemsPerPage,
    pageCursor * feedItemsPerPage + feedItemsPerPage
  )
}

function sortFeed(feed) {
  return _.sortBy(feed, (i) => parseInt(i.objectId)).reverse()
}
