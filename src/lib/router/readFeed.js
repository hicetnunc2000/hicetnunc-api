'use strict'

const conseil = require('conseil')

const { getIpfsHash, paginateFeed, sortFeed } = require('utils')

module.exports = async function readFeed(req, res) {
  const rawFeed = await conseil.getArtisticUniverse(0)
  const pageCursor = parseInt(req.body.counter)
  const feed = paginateFeed(sortFeed(rawFeed), pageCursor)

  res.json({
    result: await Promise.all(
      feed.map(async (objkt) => {
        objkt.token_info = await getIpfsHash(objkt.ipfsHash)
        objkt.token_id = parseInt(objkt.objectId)

        console.log(objkt)

        return objkt
      })
    ),
  })
}
