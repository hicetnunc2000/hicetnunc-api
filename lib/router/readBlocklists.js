'use strict'

const { getRestrictedAddresses } = require('./../utils')

module.exports = async function readBlocklists(req, res) {
  const wallet = req.query.tz
  const restrictedAddresses =  await getRestrictedAddresses().catch(() => [] )

  if (restrictedAddresses && !restrictedAddresses.includes(wallet)) {
    return res
      .status(200)
      .json({blocked: false})
  } else {
    res
      .status(200)
      .json({blocked: true})
  }
}