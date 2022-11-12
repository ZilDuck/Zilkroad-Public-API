
const logger = require('../logger.js');
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()



function SitewideStats(result)
{
    console.log(result)
    return {
        sitewide_listed : result.sitewide_listed,
        sitewide_sold : result.sitewide_sold,
        sitewide_sum_buyer_spent:  result.sitewide_sum_buyer_spent,
        sitewide_sum_royalty_sent : result.sitewide_sum_royalty_sent,
        sitewide_unique_buyers : result.sitewide_unique_buyers,
        sitewide_unique_sellers : result.sitewide_unique_sellers,
        sitewide_unique_royalty_recipient : result.sitewide_unique_royalty_recipient,
    }
}

async function GetSitewideStats()
{
    const result = await DBGetSitewideStats().catch((error) => {throw error})
    return result
}


async function DBGetSitewideStats()
{
    logger.infoLog(`MODEL - SitewideStats - DBGetSitewideStats - HIT`)
    const dbResult = await pgClient.query("SELECT * FROM fn_getSiteStats()").catch((error) => {
        logger.errorLog(`Unable to get site stats from DB: ${error}`)
        throw 'Unable to get site stats'
    })

    var result = SitewideStats(dbResult.rows[0])

    logger.debugLog(result)
    return result
}

module.exports = {
    GetSitewideStats
}