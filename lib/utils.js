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
  const objkt = await conseil.getObjectById(id, with_swaps=with_swaps).catch(() => {})
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
