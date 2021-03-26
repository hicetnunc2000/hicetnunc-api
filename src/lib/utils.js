'use strict'

const FEED_ITEMS_PER_PAGE = process.env.FEED_ITEMS_PER_PAGE || 30

const axios = require('axios')
const conseil = require('conseil')
const _ = require('lodash')

module.exports = {
  getIpfsHash,
  getObjktById,
  getObjktOwners,
  paginateFeed,
  sortFeed,
}

async function getIpfsHash(ipfsHash) {
  return (await axios.get('https://cloudflare-ipfs.com/ipfs/' + ipfsHash)).data
}

async function getObjktById(id, res) {
  const objkt = await conseil.getObjectById(id)

  objkt.token_id = objkt.objectId

  const [objktOwners, ipfsHash] = await Promise.all([
    getObjktOwners(objkt),
    getIpfsHash(objkt.ipfsHash),
  ])

  Object.assign(objkt, objktOwners, {
    token_info: ipfsHash,
  })

  return objkt
}

async function getObjktOwners(objkt) {
  const owners = (
    await axios.get(
      'https://api.better-call.dev/v1/contract/mainnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/tokens/holders?token_id=' +
        objkt.token_id
    )
  ).data
  const ownerAddrs = _.values(owners)

  return {
    total_amount:
      ownerAddrs.map((e) => parseInt(e)).length > 0
        ? ownerAddrs.filter((e) => parseInt(e) > 0).reduce(paginateFeed)
        : 0,
    owners,
  }
}

function paginateFeed(feed, cursor) {
  return feed.slice(
    cursor * FEED_ITEMS_PER_PAGE,
    cursor * FEED_ITEMS_PER_PAGE + FEED_ITEMS_PER_PAGE
  )
}

function sortFeed(feed) {
  return _.sortBy(feed, (i) => parseInt(i.objectId)).reverse()
}
