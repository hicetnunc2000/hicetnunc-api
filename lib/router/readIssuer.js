'use strict'

const conseil = require('./../conseil')
const _ = require('lodash')

const { getIpfsHash, getObjktOwners, getRestrictedAddresses } = require('./../utils')
const { burnAddress } = require('./../config')

module.exports = async function readIssuer(req, res) {
  const issuerAddress = req.body.tz
  const restrictedAddresses = await getRestrictedAddresses()

  if (restrictedAddresses.includes(issuerAddress)) {
    return res.json({ result: [] })
  }

  const [collection, creations, hdao] = await Promise.all([
    conseil.getCollectionForAddress(issuerAddress),
    conseil.getArtisticOutputForAddress(issuerAddress),
    conseil.gethDaoBalanceForAddress(issuerAddress),
  ])

  const filteredCreations = await _filteredBurnedCreations(creations)

  const unsortedResults = await Promise.all(
    [...collection, ...filteredCreations].map(async (objkt) => {
      objkt.token_info = await getIpfsHash(objkt.ipfsHash)
      objkt.token_id = parseInt(objkt.piece || objkt.objectId)

      return objkt
    })
  )

  const sortedResults = _sortResults(unsortedResults)

  return res.json({
    result: _.uniqBy(sortedResults, (objkt) => {
      return objkt.token_id
    }),
    hdao: hdao,
  })
}

async function _filteredBurnedCreations(creations) {
  const validCreations = []

  await Promise.all(
    creations.map(async (c) => {
      c.token_id = c.objectId

      const ownerData = await getObjktOwners(c)

      Object.assign(c, ownerData)

      const burnAddrCount =
        c.owners[burnAddress] && parseInt(c.owners[burnAddress])
      const allIssuesBurned = burnAddrCount && burnAddrCount === c.total_amount

      if (!allIssuesBurned) {
        delete c.owners

        validCreations.push(c)
      }
    })
  )

  return validCreations
}

function _sortResults(results) {
  const unsortedCollection = []
  const unsortedCreations = []

  results.map((r) =>
    r.piece ? unsortedCollection.push(r) : unsortedCreations.push(r)
  )

  return [
    ..._sort(unsortedCollection, 'piece'),
    ..._sort(unsortedCreations, 'objectId'),
  ]

  function _sort(arr, sortKey) {
    return arr.sort((a, b) => parseInt(b[sortKey]) - parseInt(a[sortKey]))
  }
}
