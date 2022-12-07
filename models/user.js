const { toBech32Address, fromBech32Address } = require('@zilliqa-js/crypto')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const indexer = require('../utils/indexer.js')
const logger = require('../logger')
const addressUtil = require('../utils/addressUtils.js')
const { Zilliqa, validation } = require('@zilliqa-js/zilliqa')
const zilliqa = new Zilliqa(process.env.current_network) // Shouldn't we be exporting the one from expressUtils?

/*
 * SHAPE DEFINITION
 */

async function GetUserCollection(user_address_array) {
    logger.debugLog(user_address_array)
    logger.infoLog(`MODEL - UserModel - GetUserCollection - HIT`)
    const response = await Promise.all(user_address_array.map(x => GetContract(x.toString())))
    return response
}

async function GetUser(user_address)
{
    logger.infoLog(`MODEL - UserModel - GetUser - HIT`)
    var limit = 15
    var offset = 0
    let user_address_b16
    try {
        user_address_b16 = addressUtil.NormaliseAddressToBase16(user_address)
    } catch (error) {
        throw error
    }
    const fungible_token_balance = await APIGetHeldTokensForUser(user_address_b16).catch(error => {throw error})
    const user_stats = await DBGetAccumulativeStatsForUser(user_address_b16).catch(error => {throw error})
    const zil_balance = await APIGetZilBalanceForUser(user_address_b16).catch(error => {throw error})
    const wallet_activity = await DBGetPaginatedUserWalletActivity(user_address_b16, limit, offset).catch(error => {throw error})

    return {
        user_address_b16,
        user_address_b32 : toBech32Address(user_address_b16),
        zil_balance,
        fungible_token_balance,
        user_stats,
        wallet_activity
    }
}

/*
 * SHAPE CREATORS
 */


async function GetPageUserListing(user_address, limit_rows, offset_rows) {
    let user_address_b16
    try {
        user_address_b16 = addressUtil.NormaliseAddressToBase16(user_address)
    } catch (error) {
        throw error
    }
    const response = await DBGetPaginatedUserListings(user_address_b16, limit_rows, offset_rows).catch((error) => {throw error})

    return response
}

/*
 * SHAPE DATA UTILS
 */ 

async function APIGetZilBalanceForUser(user_address) {
    let user_address_b16
    try {
        user_address_b16 = addressUtil.NormaliseAddressToBase16(user_address)
    } catch (error) {
        throw error
    }
    const zil_balance = await zilliqa.blockchain.getBalance(user_address_b16).catch(error => {
        logger.errorLog(`Unable to get balance for user: ${user_address}: ${error}`)
        throw 'Unable to get balance for user'
    })
    return zil_balance.result
}

async function APIGetHeldTokensForUser(user_address)
{
    logger.infoLog(`API - PUBLIC - GetHeldTokensForUser - HIT`)
    let user_address_b16
    try {
        user_address_b16 = addressUtil.NormaliseAddressToBase16(user_address)
    } catch (error) {
        throw error
    }

    const token_db_result = await pgClient.query("SELECT * FROM fn_getAllSupportedFungibleAddresses()").catch((error) => {
        logger.errorLog(`Unable to get confirmation of supported fungibles: ${error}`)
        throw 'Unable to get confirmation of supported fungibles'
    })
    
    var requestArray = [];
    token_db_result.rows.forEach(async result =>
    {
        requestArray.push([
            result.fungible_address.substring(2),
            'balances',
            [user_address_b16],
        ]);
    });

    const allRequestState = await zilliqa.blockchain.getSmartContractSubStateBatch(requestArray).catch((error) => {
        logger.errorLog(`Unable to get Substate for contracts: ${requestArray}: ${error}`)
        throw 'Unable to get Substates for contracts'
    })
    var token_result = allRequestState.batch_result.find(x => x.result !== undefined).result

    return token_result
}

async function APIGetNFTHeldByWallet(user_address)
{
    logger.infoLog(`API - PUBLIC - GetNFTHeldByWallet - HIT`)
    let user_address_b16
    try {
        user_address_b16 = addressUtil.NormaliseAddressToBase16(user_address)
    } catch (error) {
        throw error
    }

    var result = await indexer.GetNFTsForAddress(user_address_b16).catch((error) => {throw error})
    logger.debugLog(result.data)
    return result.data
}

async function DBGetAccumulativeStatsForUser(user_address_b16)
{
    logger.infoLog(`API - PUBLIC - GetAccumulativeStatsForUser - HIT`)
    const sql = 'SELECT * FROM fn_getaccumulativestatsforuser($1)'
    const values = [
        user_address_b16
    ]

    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get stats for user: ${user_address_b16}: ${error}`)
        throw 'Unable to get stats for user'
    })
    logger.debugLog(result.rows)
    return result.rows[0]
}

async function DBGetPaginatedUserListings(user_address, limit_rows, offset_rows) {
    logger.infoLog(`API - PUBLIC - GetPaginatedUserListings - HIT`)
    const sql = 'SELECT * FROM fn_getPaginatedListingForUser($1, $2, $3)'
    const values = [
        user_address,
        limit_rows,
        offset_rows
    ]

    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get paginated listing data for user: ${user_address} (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
        throw 'Unable to get paginated listing data for user'
    })
    logger.debugLog(result.rows)
    return result.rows
}

async function DBGetPaginatedUserWalletActivity(user_address, limit_rows, offset_rows)
{
    logger.infoLog(`API - PUBLIC - GetPaginatedUserWalletActivity - HIT`)
    
    const sql = 'SELECT * FROM fn_getpaginatedactivityforuser($1, $2, $3)'
    const values = [
        user_address,
        limit_rows,
        offset_rows
    ]

    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get wallet activity for user: ${user_address} (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
        throw 'Unable to get wallet activity for user'
    })
    result.rows.forEach(function(object) {
        object.contract_address_b32 = validation.isBech32(object.contract) ? object.contract : toBech32Address(object.contract)
    })
    logger.debugLog(result.rows)
    return result.rows
}

async function DBGetRankedWalletActivity(filter)
{
    const limit = 25
    const offset = 0
    const startTime = 0
    const endTime = 9999999999999
    var sql = ''
    if (filter === "royalties") {
        sql = 'SELECT * FROM fn_getPaginatedTopRoyalties($1, $2, $3, $4)'
    }
    else if (filter === "sellers") {
        sql = 'SELECT * FROM fn_getPaginatedTopSellers($1, $2, $3, $4)'
    } else {
        sql = 'SELECT * FROM fn_getPaginatedTopBuyers($1, $2, $3, $4)'
    }
    const values = [limit, offset, startTime, endTime]
    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get ranked wallet activity for ${filter}: ${error}`)
        throw 'Unable to get ranked wallet activity for a filter'
    })
    result.rows.forEach(function(object) {
        object.wallet_address_b32 = validation.isBech32(object.address) ? object.address : toBech32Address(object.address)
    })
    logger.debugLog(result.rows)
    return result.rows
}



module.exports = {
    GetUser,
    GetUserCollection,
    GetPageUserListing,
    APIGetHeldTokensForUser,
    APIGetNFTHeldByWallet,
    APIGetZilBalanceForUser,
    DBGetAccumulativeStatsForUser,
    DBGetPaginatedUserListings,
    DBGetPaginatedUserWalletActivity,
    DBGetRankedWalletActivity
  }
