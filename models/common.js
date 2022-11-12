const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
/*
 * COMMON SHAPE UTILS
 */ 
async function DBGetVerifiedStatusForNonFungible(nonfungible_address)
{
  logger.infoLog(`API - PUBLIC - DBGetVerifiedStatusForNonFungible - HIT`)
  const sql = 'SELECT * FROM fn_getVerifiedStatusForNonFungible ($1)'
  const values = [
    nonfungible_address
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get verification status for contract: ${nonfungible_address}: ${error}`)
    throw 'Unable to get verification status for contract'
  })
  logger.debugLog(result.rows)
  return result.rows
}


module.exports = {
    DBGetVerifiedStatusForNonFungible
}