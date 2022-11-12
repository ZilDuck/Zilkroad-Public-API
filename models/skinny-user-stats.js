
const logger = require('../logger.js');
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const { toBech32Address } = require('@zilliqa-js/crypto')

// SHOW ME REDUCED USER STATS

/*
 * SHAPE DEFINITION
 */
async function getSkinnyUserStats(limit_rows, offset_rows, unix_from, unix_to)
{
    const topWallets = await GetTopWalletStats(limit_rows, offset_rows, unix_from, unix_to).catch((error) => {throw error})

    var resultArray = [];
    for(const wallet in topWallets)
    {
        const row = ReducedUserStats(
            topWallets[wallet].address,
            topWallets[wallet].usd_value,
            topWallets[wallet].quantity,
            topWallets[wallet].text
        )
        resultArray.push(row)
    }
    return resultArray
}


function ReducedUserStats(user_address_b16, lifetime_sales_usd, lifetime_quantity, sales_category)
{
    return {
        user_address_b16,
        user_address_b32 : toBech32Address(user_address_b16),
        lifetime_sales_usd,
        lifetime_quantity,
        sales_category
    }
}

/*
 * MODEL HOOKS
 */
async function GetTopWalletStats(limit_rows, offset_rows, unix_from, unix_to)
{
    logger.infoLog(`MODEL - SkinnyUserStats - GetTopWalletStats - HIT`)

    const sql = "SELECT * FROM fn_getTopWalletActivityForPeriod($1, $2, $3, $4)";
    const values = [limit_rows, offset_rows, unix_from, unix_to];

    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get stats for users between (from: ${unix_from} to: ${unix_to}): ${error}`)
        throw 'Unable to get user stats'
    })
    logger.debugLog(result.rows)
    return result.rows
}

module.exports = {
    getSkinnyUserStats
}