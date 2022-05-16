const logger = require('../logger.js');
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const { toBech32Address } = require('@zilliqa-js/crypto')
const indexer = require('../utils/indexer')

// GIVEN WE HAVE A OID - RETURN ME THE SHAPE

/*
 * SHAPE DEFINITION
 */ 
async function GetListing(static_order_id)
{
    logger.infoLog(`MODEL - ListingModel - GetListing - HIT - Checking orderID ${static_order_id}`)
    const listingData = await DBGetListing(static_order_id).catch((error) => console.log(error))

    for (var res in listingData) {
        logger.debugLog(res)
        let static_order_id = listingData[res].static_order_id
        let listing_tx  =listingData[res].listing_transaction_hash
        let token_id  =listingData[res].token_id
        let nonfungible_address  =listingData[res].nonfungible_address
        let fungible_amount  =listingData[res].listing_fungible_token_price
        let listing_block  =listingData[res].listing_block
        let listing_unix =listingData[res].listing_unixtime
        let listing_user_address  =listingData[res].listing_user_address
        let fungible_name  =listingData[res].fungible_name
        let fungible_symbol  =listingData[res].fungible_symbol
        let fungible_decimals  =listingData[res].decimals
        let fungible_address =listingData[res].fungible_address

        return {  //sort multiple???
            static_order_id,
            contract_address_b16: nonfungible_address,
            contract_address_b32: toBech32Address(nonfungible_address),
            token_id,
            fungible_name,
            fungible_symbol,
            fungible_decimals,
            fungible_address_b16: fungible_address,
            fungible_address_b32: toBech32Address(fungible_address),
            fungible_amount,
            listing_user_b16: listing_user_address,
            listing_user_b32: toBech32Address(listing_user_address),
            listing_block,
            listing_unix,
            listing_tx
        }
    }
}

async function GetNftListing(contract_address, token_id) {
    logger.infoLog(`MODEL - ListingModel - GetListing - HIT - Checking token ${contract_address}/${token_id}`)
    const listingData = await DBGetListing(token_id, contract_address).catch((error) => console.log(error))

    for (var res in listingData) {
        logger.debugLog(res)
        let static_order_id = listingData[res].static_order_id
        let listing_tx = listingData[res].listing_transaction_hash
        let token_id = listingData[res].token_id
        let nonfungible_address = listingData[res].nonfungible_address
        let fungible_amount = listingData[res].listing_fungible_token_price
        let listing_block = listingData[res].listing_block
        let listing_unix = listingData[res].listing_unixtime
        let listing_user_address = listingData[res].listing_user_address
        let fungible_name = listingData[res].fungible_name
        let fungible_symbol = listingData[res].fungible_symbol
        let fungible_decimals = listingData[res].decimals
        let fungible_address = listingData[res].fungible_address

        const listing = {  //sort multiple???
            static_order_id,
            contract_address_b16: nonfungible_address,
            contract_address_b32: toBech32Address(nonfungible_address),
            token_id,
            fungible_name,
            fungible_symbol,
            fungible_decimals,
            fungible_address_b16: fungible_address,
            fungible_address_b32: toBech32Address(fungible_address),
            fungible_amount,
            listing_user_b16: listing_user_address,
            listing_user_b32: toBech32Address(listing_user_address),
            listing_block,
            listing_unix,
            listing_tx
        }
        return { listing }
    }
}

async function GetIndexerNftListing(contract_address, token_id) {
    const contractState = await indexer.GetContractState('0xB4FA69997f7560fe48F375b03F73B8774cB3BF5A').then(r => r.data).catch((error) => console.log(error))

    if (contractState.listing_map) {
        for (const [orderId, listingData] of Object.entries(contractState.listing_map)) {
            let listing_contract_address = listingData.arguments[0].arguments[0]
            let listing_token_id = listingData.arguments[0].arguments[1]
            let listing_fungible = listingData.arguments[1].arguments[1]
            let listing_amount = listingData.arguments[1].arguments[2]

            console.log(listing_contract_address + ' ' + contract_address)
            console.log(listing_token_id + ' ' + token_id)

            if (listing_contract_address.toLowerCase() === contract_address.toLowerCase() && listing_token_id === token_id) {
                console.log('LISTING FOUND')
                return {
                    listing: {
                        orderId: orderId,
                        listing_fungible,
                        listing_amount
                    }
                }
            }
        }
    }
}

/*
 * SHAPE CREATORS
 */


/*
 * SHAPE UTILS
 */
async function DBGetListing(order_id) {
    logger.infoLog(`MODEL- NFTModel - DBGetNonFungibleTokenSalesData - HIT`)

    const sql = 'SELECT * FROM fn_getListingForOrderID($1)'
    const values = [
        order_id
    ]
    var result = await pgClient.query(sql, values)
    logger.debugLog(result.rows)
    return result.rows
}

async function DBGetListing(token_id, contract_address) {
    logger.infoLog(`MODEL- NFTModel - DBGetNonFungibleTokenSalesData - HIT`)

    const sql = 'SELECT * FROM fn_getOrderIDForNonFungibleToken($1, $2)'
    const values = [
        token_id,
        contract_address
    ]
    var result = await pgClient.query(sql, values)
    logger.debugLog(result.rows)
    return result.rows
}

module.exports = {
    GetListing,
    GetNftListing
}