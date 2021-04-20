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

const _block_levels = {
  39_000: 1436072,
  38_000: 1434792,
  37_000: 1433459,
  36_000: 1432197,
  35_000: 1431211,
  34_000: 1430094,
  33_000: 1428886,
  32_000: 1427562,
  31_000: 1426276,
  30_000: 1424923,
  29_000: 1423576,
  28_000: 1422176,
  27_000: 1420800,
  26_000: 1419345,
  25_000: 1417775, 
  24_000: 1416229,
  23_000: 1414740,
  22_000: 1413317,
  21_000: 1411763,
  20_000: 1410465,
  19_000: 1409213,
  18_000: 1407853,
  17_000: 1406495,
  16_000: 1404892,
  15_000: 1403406,
  14_000: 1401962,
  13_000: 1400470,
  12_000: 1398667,
  11_000: 1396760,
  10_000: 1394970,
  9000: 1393010,
  8000: 1390594,
  7000: 1388547,
  6000: 1384721,
  5000: 1382041,
  4000: 1379648,
  3000: 1377717,
  2000:1375633,
  1000:1372553,
  0: 1365242}


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
  
  Object.assign(objkt, objktOwners, {
    token_info: ipfsMetadata,
    swaps: []
  })
  return objkt
  
}

async function getObjktById(id, with_swaps=true) {
  const id_int = (typeof id == 'string') ? parseInt(id) : id
  let block_range = Math.floor(id_int / 1000)
  let block_start = _block_levels[Math.max(Math.min(block_range * 1000, 38_000), 0)]
  let block_end = (block_range <= 38) ? _block_levels[Math.min((block_range + 1) * 1000, 39000)] : null
  const objkt = await conseil.getObjectById(id, with_swaps=with_swaps, block_start, block_end).catch(() => {})
  try {
    objkt.token_id = objkt.objectId

    const [objktOwners, ipfsMetadata] = await Promise.all([
      getObjktOwners(objkt),
      getIpfsHash(objkt.ipfsHash),
    ])

    Object.assign(objkt, objktOwners, {
      token_info: ipfsMetadata
    })

    return objkt
  } catch {
    return {}
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
