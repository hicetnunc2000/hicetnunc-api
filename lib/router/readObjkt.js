'use strict'

const { getObjktById, getRestrictedObjkts, getRestrictedAddresses } = require('./../utils')

module.exports = async function readObjkt(req, res) {
  const objktId = req.body.objkt_id
  const restrictedObjkts = await getRestrictedObjkts().catch(() => [])

  if (restrictedObjkts.includes(objktId)) {
    return res.status(410).send('Object is restricted and/or from a copyminter');
  }
  const objekt = await getObjktById(objktId)
  const restrictedAddresses = await getRestrictedAddresses().catch(() => [])
  if (restrictedAddresses.includes(objekt.token_info.creators[0])) {
    return res.status(410).send('Object is restricted and/or from a copyminter');
  }

  return res.json({ result: objekt })
}
