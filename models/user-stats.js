const logger = require('../logger.js');
const client = require('../utils/expressUtils.js')
const proxyUtils = require('../utils/proxyUtils.js')
const fungibleTokens = require('./fungible-tokens.js')
const pgClient = client.ReturnPool()
const { toBech32Address } = require('@zilliqa-js/crypto')

// SHOW ME USER STATS

/*
 * SHAPE DEFINITION
 */
async function getUserStats(searchType, startTime, endTime, limit, offset) {

    var resultArray = [];
    if(searchType.toLowerCase() == "top" || searchType.toLowerCase() == "buyer" || searchType.toLowerCase() == "seller" || searchType.toLowerCase() == "royalties")
    {
        if(searchType.toLowerCase() == "buyer")
        {
            resultArray = await GetTopBuyerStats(limit, offset, startTime, endTime).catch((error) => {throw error})
        }
        if(searchType.toLowerCase() == "seller")
        {
            resultArray = await GetTopSellerStats(limit, offset, startTime, endTime).catch((error) => {throw error})
        }
        if(searchType.toLowerCase() == "royalties")
        {
            resultArray = await GetTopRoyaltyStats(limit, offset, startTime, endTime).catch((error) => {throw error})
        }
    }
    else {
        throw 'Unable to get user stats'
    }
    return resultArray;
}

function UserStats(
    user_address_b16,
    lifetime_sales_usd,
    lifetime_quantity, 
    WZIL_volume,
    GZIL_volume,
    XSGD_volume,
    zWBTC_volume,
    zWETH_volume,
    zUSDT_volume,
    DUCK_volume
) {
    return {
        user_address_b16,
        user_address_b32 : toBech32Address(user_address_b16),
        lifetime_sales_usd,
        lifetime_quantity,
        WZIL_volume,
        GZIL_volume,
        XSGD_volume,
        zWBTC_volume,
        zWETH_volume,
        zUSDT_volume,
        DUCK_volume 
    }
}

/*
 * MODEL HOOKS
 */
async function GetTopBuyerStats(limit_rows, offset_rows, startTime, endTime)
{
    logger.infoLog(`MODEL - UserStats - GetTopBuyerStats - HIT`)
    const sql = 'SELECT * FROM fn_getPaginatedTopBuyers($1, $2, $3, $4)'
    const values = [limit_rows, offset_rows, startTime, endTime]

    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get top buyers: ${error}`)
        throw 'Unable to get top buyers'
    })

    var resultArray = [];
    for(var res in result.rows)
    {
        const row = UserStats(
            result.rows[res].buyer_address,
            result.rows[res].lifetime_sales_usd,
            result.rows[res].lifetime_quantity_sold, 
            result.rows[res].wzil_volume,
            result.rows[res].gzil_volume,
            result.rows[res].xsgd_volume,
            result.rows[res].zwbtc_volume,
            result.rows[res].zweth_volume,
            result.rows[res].zusdt_volume,
            result.rows[res].duck_volume
        )
        resultArray.push(row)
    }
    return resultArray
}

async function GetTopSellerStats(limit_rows, offset_rows, startTime, endTime)
{
    logger.infoLog(`MODEL - UserStats - GetTopSellerStats - HIT`)
    const sql = 'SELECT * FROM fn_getPaginatedTopSellers($1, $2, $3, $4)'
    const values = [limit_rows, offset_rows, startTime, endTime]

    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get top sellers: ${error}`)
        throw 'Unable to get top sellers'
    })

    var resultArray = [];
    for(var res in result.rows)
    {
        const row = UserStats(
            result.rows[res].seller_address,
            result.rows[res].lifetime_sales_usd,
            result.rows[res].lifetime_quantity_sold,
            result.rows[res].wzil_volume,
            result.rows[res].gzil_volume,
            result.rows[res].xsgd_volume,
            result.rows[res].zwbtc_volume,
            result.rows[res].zweth_volume,
            result.rows[res].zusdt_volume,
            result.rows[res].duck_volume
        )
        resultArray.push(row)
    }
    return resultArray
}

async function GetTopRoyaltyStats(limit_rows, offset_rows, startTime, endTime)
{
    logger.infoLog(`MODEL - UserStats - GetTopRoyaltyStats - HIT`)
    const sql = 'SELECT * FROM fn_getPaginatedTopRoyalties($1, $2, $3, $4)'
    const values = [limit_rows, offset_rows, startTime, endTime]

    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get top royalty earners: ${error}`)
        throw 'Unable to get top royalty earners'
    })

    var resultArray = [];
    for(var res in result.rows)
    {
        const row = UserStats(
            result.rows[res].royalty_address,
            result.rows[res].lifetime_sales_usd,
            result.rows[res].lifetime_quantity_royalty,
            result.rows[res].wzil_volume,
            result.rows[res].gzil_volume,
            result.rows[res].xsgd_volume,
            result.rows[res].zwbtc_volume,
            result.rows[res].zweth_volume,
            result.rows[res].zusdt_volume,
            result.rows[res].duck_volume
        )
        resultArray.push(row)
    }
    return resultArray
}


/*
 * CALLING FUNCTIONS
 */

module.exports = {
    getUserStats
}