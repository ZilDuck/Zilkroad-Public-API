const { toBech32Address, fromBech32Address } = require('@zilliqa-js/crypto')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const indexer = require('../utils/indexer.js')
const logger = require('../logger')
const { Zilliqa, validation } = require('@zilliqa-js/zilliqa')
const zilliqa = new Zilliqa(process.env.current_network) // Shouldn't we be exporting the one from expressUtils?

/*
 * SHAPE DEFINITION
 */

async function GetUserCollection(user_address_array) {
    console.log(user_address_array)
    logger.infoLog(`MODEL - UserModel - GetUserCollection - HIT`)
    const response = await Promise.all(user_address_array.map(x => GetContract(x.toString())))
    return response
}

async function GetUser(user_address_b16)
{
    logger.infoLog(`MODEL - UserModel - GetUser - HIT`)
    if(user_address_b16.startsWith('zil1'))
    {
        user_address_b16 = fromBech32Address(user_address_b16)
    }
    const fungible_token_balance = await APIGetHeldTokensForUser(user_address_b16).catch(error => console.log(error))
    const user_stats = await DBGetAccumulativeStatsForUser(user_address_b16).catch(error => console.log(error))
    const zil_balance = await APIGetZilBalanceForUser(user_address_b16).catch(error => console.log(error))
    const wallet_activity = await DBGetPaginatedUserWalletActivity(user_address_b16).catch(error => console.log(error))

    return {
        user_address_b16,
        user_address_b32: toBech32Address(user_address_b16),
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
    let user_address_b32

    if (validation.isBech32(user_address)) {
        user_address_b16 = fromBech32Address(user_address)
        user_address_b32 = user_address
    } else {
        user_address_b16 = user_address
        user_address_b32 = toBech32Address(user_address)
    }
    const response = await DBGetPaginatedUserListings(user_address_b16, limit_rows, offset_rows)

    return response
}

/*
 * SHAPE DATA UTILS
 */ 

async function APIGetZilBalanceForUser(user_address_b16) {
    const zil_balance = await zilliqa.blockchain.getBalance(user_address_b16).catch(error => console.log(error))
    return zil_balance.result
}

async function APIGetHeldTokensForUser(user_address_b16)
{
    logger.infoLog(`API - PUBLIC - GetHeldTokensForUser - HIT`)

    const token_db_result = await pgClient.query("SELECT * FROM fn_getAllSupportedFungibleAddresses()")
    
    var requestArray = [];
    token_db_result.rows.forEach(async result =>
    {
        requestArray.push([
            result.fungible_address.substring(2),
            'balances',
            [user_address_b16],
        ]);
    });

    const allRequestState = await zilliqa.blockchain.getSmartContractSubStateBatch(requestArray);
    var token_result = allRequestState.batch_result.find(x => x.result !== undefined).result

    return token_result
}

async function APIGetNFTHeldByWallet(user_address_b16)
{
    logger.infoLog(`API - PUBLIC - GetNFTHeldByWallet - HIT`)

    var result = await indexer.GetNFTsForAddress(user_address_b16)
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

    var result = await pgClient.query(sql, values)
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

    var result = await pgClient.query(sql, values)
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

    var result = await pgClient.query(sql, values)
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
    var result = await pgClient.query(sql, values)
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