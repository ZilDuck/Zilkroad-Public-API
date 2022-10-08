const client = require('../utils/expressUtils')
const pgClient = client.ReturnPool()
const logger = require('../logger.js')

async function GetAValidCardAdvertisements() {
  logger.infoLog(`API - PUBLIC - GetCardAdvertisement - HIT`)

  const sql = 'SELECT * FROM fn_getCardAdvertisement()'

  var result = await pgClient.query(sql)
  logger.debugLog(result.rows)
  return result.rows
}

module.exports = {
  GetAValidCardAdvertisements
}