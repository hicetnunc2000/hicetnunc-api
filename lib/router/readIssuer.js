'use strict'

const conseil = require('./../conseil')
const _ = require('lodash')

const { getIpfsHash, getObjktOwners, getRestrictedAddresses, getRestrictedObjkts } = require('./../utils')
const { burnAddress } = require('./../config')

module.exports = async function readIssuer(req, res) {
  const issuerAddress = req.body.tz
  const restrictedAddresses = await getRestrictedAddresses().catch(() => [])
  const restrictedObjkts = await getRestrictedObjkts().catch(() => [])

  if (restrictedAddresses.includes(issuerAddress)) {
    return res.status(410).send('Wallet/User is restricted and/or a copyminter');
  }

  const [collection, creations, hdao, swaps] = await Promise.all([
    conseil.getCollectionForAddress(issuerAddress),
    conseil.getArtisticOutputForAddress(issuerAddress),
    conseil.gethDaoBalanceForAddress(issuerAddress),
    conseil.getSwapsForAddress(issuerAddress),
  ])

  const filteredCreations = await _filteredBurnedCreations(creations)

  const unsortedResults = await Promise.all(
    [...collection, ...filteredCreations]
      .filter(objkt => !restrictedObjkts.includes(parseInt(objkt.piece || objkt.objectId)))
      .map(async (objkt) => {
        objkt.token_info = await getIpfsHash(objkt.ipfsHash)
        objkt.token_id = parseInt(objkt.piece || objkt.objectId)

        return objkt
    })
  )

  const swap_groups = swaps.reduce((groups, item) => {
    const group = (groups[item.token_id] || []);
    group.push(_.omit(item, 'token_id'));
    groups[item.token_id] = group;
    return groups;
  }, {});

  const sortedResults = _sortResults(unsortedResults)

  return res.json({
    result: _.uniqBy(sortedResults, (objkt) => {
      return objkt.token_id
    }),
    hdao: hdao,
    swaps: swap_groups,
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
