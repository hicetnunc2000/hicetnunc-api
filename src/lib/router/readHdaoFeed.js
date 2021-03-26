'use strict'

const _ = require('lodash')
const conseil = require('conseil')

const { getObjktById, paginateFeed } = require('utils')

module.exports = async function readHdaoFeed(req, res) {
  let rawFeed = await conseil.hDAOFeed()

  rawFeed = _.orderBy(rawFeed, ['hDAO_balance'], ['desc'])

  res.json({
    result: await Promise.all(
      paginateFeed(rawFeed, 0).map(async (objkt) => await _mergeHdao(objkt))
    ),
  })
}

async function _mergeHdao(objkt) {
  const mergedObjkt = await getObjktById(objkt.token_id)

  mergedObjkt.hDAO_balance = objkt.hDAO_balance

  return mergedObjkt
}
