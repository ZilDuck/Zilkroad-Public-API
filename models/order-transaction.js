const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const logger = require('../logger')

async function getListedTransactionHashForOrderID(orderID)
{
    logger.infoLog(`MODEL - OrderTransaction - getListedTransactionHashForOrderID - HIT`)

    const sql = "SELECT * FROM fn_getListedTransactionHashForOrderID($1)";
    const values = [orderID];

    var result = await pgClient.query(sql, values)
    logger.debugLog(result.rows)
    return result.rows
}

async function getSoldTransactionHashForOrderID(orderID)
{
    logger.infoLog(`MODEL - OrderTransaction - getTransactigetSoldTransactionHashForOrderIDonHashForOrderID - HIT`)

    const sql = "SELECT * FROM fn_getSoldTransactionHashForOrderID($1)";
    const values = [orderID];

    var result = await pgClient.query(sql, values)
    logger.debugLog(result.rows)
    return result.rows
}

module.exports = {
    getListedTransactionHashForOrderID,
    getSoldTransactionHashForOrderID
}
