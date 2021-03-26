'use strict'

const axios = require('axios')
const conseil = require('conseil')
const _ = require('lodash')
const { getIpfsHash } = require('utils')

module.exports = async function readIssuer(req, res) {
  const list = (
    await axios.get(
      'https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/w.json'
    )
  ).data
  const tezosAddr = req.body.tz

  if (list.includes(tezosAddr)) {
    return res.json({ result: [] })
  }

  const [collection, creations, hdao] = await Promise.all([
    conseil.getCollectionForAddress(tezosAddr),
    conseil.getArtisticOutputForAddress(tezosAddr),
    conseil.gethDaoBalanceForAddress(tezosAddr),
  ])

  const result = await Promise.all(
    [...collection, ...creations].map(async (objkt) => {
      objkt.token_info = await getIpfsHash(objkt.ipfsHash)
      objkt.token_id = parseInt(objkt.piece || objkt.objectId)

      return objkt
    })
  )

  res.json({
    result: _.uniqBy(result, (objkt) => {
      return objkt.token_id
    }),
    hdao: hdao,
  })
}
