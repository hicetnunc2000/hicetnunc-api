'use strict'

const conseil = require('./../conseil')
const _ = require('lodash')

const { getIpfsHash, paginateFeed, getObjektByIdBCD, getRestrictedObjkts, getRestrictedAddresses } = require('./../utils')

module.exports = async function readRandomFeed(req, res) {
  const latestObjekt = await conseil.getArtisticUniverse(0, 0, 2)
  const latestId = parseInt(latestObjekt[0].objectId)
  console.log(latestId, typeof latestId)
  const restrictedObjekts = await getRestrictedObjkts().catch(() => [])
  const ids = _.shuffle(_.range(latestId - 152)).map(id => id + 152)
  const filteredIds = ids.filter(id => !restrictedObjekts.includes(id)).slice(0, 20);
  const mergedFeed = await Promise.all(
    filteredIds.map(async (id) => await getObjektByIdBCD(id, false).catch(() => {}))
  )
  const restrictedAddresses =  await getRestrictedAddresses().catch(() => [])
  const filteredFeed = mergedFeed.filter(o => (typeof o !== 'undefined'))
    .filter(o => o.hasOwnProperty('token_info'))
    .filter(o => !restrictedAddresses.includes(o.token_info.creators[0]))


  const pageCursor = req.body.cursor || 0
  const feed = paginateFeed(filteredFeed, pageCursor)

  res.json({
    result: await Promise.all(
      feed.map(async (objkt) => {
        objkt.token_info = await getIpfsHash(objkt.ipfsHash)

        return objkt
      })
    ),
  })

}
