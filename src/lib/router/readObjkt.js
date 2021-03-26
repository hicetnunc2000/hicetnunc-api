'use strict'

const axios = require('axios')
const { getObjktById } = require('utils')

module.exports = async function readObjkt(req, res) {
  const list = (
    await axios.get(
      'https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/o.json'
    )
  ).data
  const objktId = req.body.objkt_id
  const tezosAddr = req.body.tz

  if (list.includes(tezosAddr)) {
    return res.json({ result: [] })
  }

  return res.json({ result: await getObjktById(objktId) })
}
