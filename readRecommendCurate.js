'use strict'

const conseil = require('./conseil')

module.exports = async function readRecommendCurate(req, res) {
  return res.json({ amount: await conseil.getRecommendedCurateDefault() })
}
