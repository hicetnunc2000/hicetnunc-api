'use strict'

const { getObjktById, getRestrictedObjkts } = require('./utils')

module.exports = async function readObjkt(req, res) {
  const objktId = req.body.objkt_id
  const restrictedObjkts = await getRestrictedObjkts()

  if (restrictedObjkts.includes(objktId)) {
    return res.json({ result: [] })
  }

  return res.json({ result: await getObjktById(objktId) })
}
