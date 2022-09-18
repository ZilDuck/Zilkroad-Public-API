const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()

async function GetAllFungibleTokens()
{
    logger.infoLog(`MODEL - Fungible - GetAllFungibleTokens - HIT`)
  
    const sql = "SELECT * FROM fn_getAllFungibleTokens()";
  
    var result = await pgClient.query(sql)
    logger.debugLog(result.rows)
    return result.rows
}

module.exports = {
    GetAllFungibleTokens
}
