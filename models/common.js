const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
/*
 * COMMON SHAPE UTILS
 */ 
async function DBGetVerifiedStatusForNonFungible(nonfungible_address)
{
  logger.infoLog(`API - PUBLIC - DBGetVerifiedStatusForNonFungible - HIT`)

  const now = parseInt((new Date().getTime() / 1000).toFixed(0))
  var date = new Date();
  const lastYear = date.setFullYear(date.getFullYear() - 1);

  const sql = 'SELECT * FROM fn_getVerifiedStatusForNonFungible ($1)'
  const values = [
    nonfungible_address
  ]
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}


module.exports = {
    DBGetVerifiedStatusForNonFungible
}