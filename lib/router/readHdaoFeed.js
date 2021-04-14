'use strict'

const _ = require('lodash')
const conseil = require('./../conseil')

const { getObjktById, paginateFeed } = require('./../utils')

module.exports = async function readHdaoFeed(req, res) {
  const rawFeed = await conseil.hDAOFeed()
  const sortedFeed = _.orderBy(rawFeed, ['hDAO_balance'], ['desc'])
  const paginatedFeed = paginateFeed(sortedFeed, 0)

  res.json({
    result: await Promise.all(
      paginatedFeed.map(async (objkt) => await _mergeHdao(objkt))
    ),
  })
}

async function _mergeHdao(objkt) {
  const mergedObjkt = await getObjktById(objkt.token_id)

  mergedObjkt.hDAO_balance = objkt.hDAO_balance

  return mergedObjkt
}
