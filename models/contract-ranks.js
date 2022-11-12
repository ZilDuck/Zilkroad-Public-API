const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()

// TODO - Duplicate
async function DBGetACollectionRank(contractAddress, timeFrom, timeTo)
{
  logger.infoLog(`FUNC - PUBLIC - getACollectionRank - HIT`)

  const sql = 'SELECT * FROM fn_getSingleCollectionsActivity($1, $2, $3)'
  const values = [
    contractAddress,
    timeFrom,
    timeTo
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get rank for collection: ${contractAddress} (from: ${timeFrom} to ${timeTo}): ${error}`)
    throw 'Unable to get rank for collection'
  })
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
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get activities for collections (from: ${timeFrom} to ${timeTo}): ${error}`)
    throw 'Unable to get any collection ranks'
  })
  logger.debugLog(result.rows)
  return result.rows
}

module.exports = {
  DBGetACollectionRank,
  DBGetAllCollectionRanks
}