'use strict'

const axios = require('axios')
const conseil = require('conseil')
const _ = require('lodash')

const { feedItemsPerPage } = require('config')

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

function paginateFeed(feed, cursor) {
  return feed.slice(
    cursor * feedItemsPerPage,
    cursor * feedItemsPerPage + feedItemsPerPage
  )
}

function sortFeed(feed) {
  return _.sortBy(feed, (i) => parseInt(i.objectId)).reverse()
}
