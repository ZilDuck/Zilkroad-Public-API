const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()

async function DBGetACollectionRank(contractAddress, timeFrom, timeTo)
{
  logger.infoLog(`FUNC - PUBLIC - getACollectionRank - HIT`)

  const sql = 'SELECT * FROM fn_getSingleCollectionsActivity($1, $2, $3)'
  const values = [
    contractAddress,
    timeFrom,
    timeTo
  ]
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetAllCollectionRanks(page, limit, timeFrom, timeTo)
{
  logger.infoLog(`FUNC - PUBLIC - getAllCollectionRanks - HIT`)

  const sql = 'SELECT * FROM fn_getCollectionsActivity($1, $2, $3, $4)'
  const values = [
    limit,
    page,
    timeFrom,
    timeTo
  ]
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}

module.exports = {
  DBGetACollectionRank,
  DBGetAllCollectionRanks
}