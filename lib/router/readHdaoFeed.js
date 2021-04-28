'use strict'

const _ = require('lodash')
const conseil = require('./../conseil')

const { getObjktById, paginateFeed, getRestrictedAddresses, getRestrictedObjkts } = require('./../utils')

module.exports = async function readHdaoFeed(req, res) {
  const rawFeed = await conseil.hDAOFeed()
  const sortedFeed = _.orderBy(rawFeed, ['hDAO_balance'], ['desc']).slice(0, 500)
  const mergedFeed = await Promise.all(
    sortedFeed.map(async (objkt) => await _mergeHdao(objkt))
  )

  const restrictedObjekts = await getRestrictedObjkts().catch(() => [])
  const restrictedAddresses =  await getRestrictedAddresses().catch(() => [])
  const filteredFeed = mergedFeed.filter(o => (typeof o !== 'undefined'))
    .filter(o => o.hasOwnProperty('token_info'))
    .filter(o => !restrictedObjekts.includes(o.token_id))
    .filter(o => !restrictedAddresses.includes(o.token_info.creators[0]))
  const counter = req.body.counter || 0
  const paginatedFeed = paginateFeed(filteredFeed, counter)

  res.json({
    result: paginatedFeed,
  })
}

async function _mergeHdao(objkt) {
  const mergedObjkt = await getObjktById(objkt.token_id, false).catch(() => {})

  mergedObjkt.hDAO_balance = objkt.hDAO_balance

  return mergedObjkt
}
