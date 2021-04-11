'use strict'

const { getObjktById, getRestrictedObjkts } = require('utils')

module.exports = async function readObjkt(req, res) {
  const { objkt_id: objktId, tz: tezosAddr } = req.body

  const restrictedObjkts = await getRestrictedObjkts()

  if (restrictedObjkts.includes(tezosAddr)) {
    return res.json({ result: [] })
  }

  return res.json({ result: await getObjktById(objktId) })
}
