'use strict'

const conseil = require('conseil')

const { getIpfsHash, paginateFeed, sortFeed } = require('utils')

module.exports = async function readFeed(req, res) {
  const isFeatured = req.path === '/featured'
  const pageCursor = req.body.counter
  const max_time = req.body.max_time
  const rawFeed = await (isFeatured
    ? conseil.getFeaturedArtisticUniverse(max_time)
    : conseil.getArtisticUniverse(max_time))

  const paginatedFeed = paginateFeed(sortFeed(rawFeed), pageCursor)
  const feed = await Promise.all(
    paginatedFeed.map(async (objkt) => {
      objkt.token_info = await getIpfsHash(objkt.ipfsHash)
      objkt.token_id = parseInt(objkt.objectId)

      return objkt
    })
  )

  return res.json({ result: feed })
}
