const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
/*
 * COMMON SHAPE UTILS
 */ 

module.exports =
{
  DBGetVerifiedStatusForNonFungible : async function(nonfungible_address)
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
  },

  DBGetExcludedStatusForNonFungible : async function(nonfungible_address)
  {
    logger.infoLog(`API - PUBLIC - DBGetExcludedStatusForNonFungible - HIT`)
    const sql = 'SELECT * FROM fn_getExcludedStatusForNonFungible ($1)'
    const values = [
      nonfungible_address
    ]
    var result = await pgClient.query(sql, values).catch((error) => {
      logger.errorLog(`Unable to get exclusion status for contract: ${nonfungible_address}: ${error}`)
      throw 'Unable to get verification status for contract'
    })
    logger.debugLog(result.rows)
    return result.rows
  }
}