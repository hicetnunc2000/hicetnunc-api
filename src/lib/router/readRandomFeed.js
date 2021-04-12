'use strict'

const conseil = require('conseil')
const _ = require('lodash')

const { getIpfsHash, paginateFeed } = require('utils')

module.exports = async function readRandomFeed(req, res) {
  const rawFeed = await conseil.getArtisticUniverse(0)
  const pageCursor = req.body.cursor
  const feed = paginateFeed(_.shuffle(rawFeed), pageCursor)

  res.json({
    result: await Promise.all(
      feed.map(async (objkt) => {
        objkt.token_info = await getIpfsHash(objkt.ipfsHash)
        objkt.token_id = parseInt(objkt.objectId)

        return objkt
      })
    ),
  })
}
