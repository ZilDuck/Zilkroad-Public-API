const { toBech32Address, fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const indexer = require('../utils/indexer.js')
const logger = require('../logger')
const utils = require('../utils/nftUtils.js')
const axios = require('axios')

//other shapes
const token = require('./token.js')
const { DBGetVerifiedStatusForNonFungible, DBGetExcludedStatusForNonFungible } = require('./common.js')
/*
 * SHAPE DEFINITION
 */
async function GetContractCollection(nonfungible_address_array) {
  logger.infoLog(`MODEL - ContractModel - GetContractCollection - HIT`)
  const response = await Promise.all(nonfungible_address_array.map(x => GetContract(x.toString())))
  return response
}

/**
 *
 * @param contract_address bech16|bech32
 * @return {Promise<{contract_symbol: *, contract_owner: *, aggregated_contract_metadata: *, royalty_recipient: *, volume_over_time: number | HTMLCollectionOf<HTMLTableRowElement> | SQLResultSetRowList | string | void, contract_name: *, primary_sales: number | HTMLCollectionOf<HTMLTableRowElement> | SQLResultSetRowList | string | void, is_verified: (*|void|boolean), floor_prices: (number|HTMLCollectionOf<HTMLTableRowElement>|SQLResultSetRowList|string), sales_history: (number|HTMLCollectionOf<HTMLTableRowElement>|SQLResultSetRowList|string), royalty_bps: *, nfts_minted: *, user_defined_metadata: unknown, contract_address_b32, contract_address_b16: *, token_balances: Awaited<ReturnType<ReturnType<typeof zilkroad>['getUserBalances']>> | Awaited<{result: {nonce: number, balance: string}}>}>}
 * @constructor
 */
async function GetContract(contract_address) {

  let contract_address_b16
  let contract_address_b32

  if (validation.isBech32(contract_address)) {
    contract_address_b16 = fromBech32Address(contract_address)
    contract_address_b32 = contract_address
  } else {
    contract_address_b16 = contract_address
    contract_address_b32 = toBech32Address(contract_address)
  }

  logger.infoLog(`MODEL - ContractModel - GetContract - HIT`)
  const indexer_state = await indexer.GetContractState(contract_address_b16).catch((error) => {throw error})
  logger.debugLog(indexer_state.data)
  const indexer_metadata = await indexer.GetStatisticsForMetadata(contract_address_b16).catch((error) => {throw error})
  const db_primary_sales = await DBGetPrimarySalesIfPresent(contract_address_b16).catch((error) => {throw error})

  const db_floors = await DBGetPaginatedCollectionFloors(0, 20).catch((error) => {throw error})
  const db_stats = await DBGetStatsForNonfungible(contract_address_b16).catch((error) => {throw error})
  const db_graph = await DBGetGraphForNonFungible(contract_address_b16).catch((error) => {throw error})
  const db_verified = await DBGetVerifiedStatusForNonFungible(contract_address_b16).catch((error) => {throw error})
  const db_excluded = await DBGetExcludedStatusForNonFungible(contract_address_b16).catch((error) => {throw error})

  const contract_name = indexer_state.data.token_name
  const contract_symbol = indexer_state.data.token_symbol
  const aggregated_contract_metadata = indexer_metadata.data
  const contract_owner = indexer_state.data.contract_owner
  const royalty_recipient = indexer_state.data.royalty_recipient
  const royalty_bps = indexer_state.data.royalty_fee_bps
  const is_verified = db_verified ?? false
  const nfts_minted = indexer_state.data.total_supply
  const token_balances = indexer_state.data.balances
  const floor_prices = db_floors
  const volume_over_time = db_graph
  const stats = db_stats[0] ?? {"listed_tokens": 0, "volume": 0}
  const primary_sales = db_primary_sales
  const verified = db_verified.length > 0
  const excluded = db_excluded.length > 0

  return {
    contract_address_b16,
    contract_address_b32,
    contract_name,
    contract_symbol,
    aggregated_contract_metadata,
    contract_owner,
    royalty_recipient,
    royalty_bps,
    verified,
    excluded,
    nfts_minted,
    token_balances,
    floor_prices,
    volume_over_time,
    stats,
    primary_sales,
  };
}

/*
 * SHAPE CREATORS
 */

async function GetPageListingForNonFungible(nonfungible_address, limit_rows, offset_rows) {
  logger.infoLog(`API - PUBLIC - GetPageListingForNonFungible - HIT`)

  const sql = 'SELECT * FROM fn_getPaginatedListingForNonFungible($1, $2, $3)'
  const values = [
    nonfungible_address,
    limit_rows,
    offset_rows
  ]

  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get listings for contract: ${nonfungible_address} (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
    throw 'Unable to get listings for contract'
  })

  var return_result = []
  for (var res in result.rows) {
    logger.debugLog(result.rows[res])
    let order_id = result.rows[res].static_order_id
    let token_id = result.rows[res].token_id
    let contract_address_b16 = result.rows[res].nonfungible_address

    let nft = await token.getToken(
      order_id,
      token_id,
      contract_address_b16
    ).catch((error) => {throw error})

    return_result.push(nft)
  }
  logger.debugLog(return_result)
  return return_result
}

//GIVEN a contract and page options, return sold TOKENS
async function GetPageSalesForNonFungible(limit_rows, offset_rows, nonfungible_address) {
  logger.infoLog(`MODEL- NFTModel - GetPageSalesForNonFungible - HIT`)

  const sql = 'SELECT * FROM fn_getPaginatedMostRecentSalesForContract($1, $2, $3)'
  const values = [
    limit_rows,
    offset_rows,
    nonfungible_address
  ]

  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get sold NFTs for contract: ${nonfungible_address} (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
    throw 'Unable to get sold NFTs for contract'
  })

  var return_result = []
  for (var res in result.rows) {
    logger.debugLog(result.rows[res])
    let order_id = result.rows[res].static_order_id
    let token_id = result.rows[res].token_id
    let contract_address_b16 = result.rows[res].nonfungible_address

    let nft = await token.getToken(
      order_id,
      token_id,
      contract_address_b16
    ).catch((error) => {throw error})

    return_result.push(nft)
  }
  logger.debugLog(return_result)
  return return_result
}

// GIVEN some pagination option, return all recently listed TOKENS
async function GetPageMostRecentListings(limit_rows, offset_rows) {
  logger.infoLog(`MODEL- NFTModel - GetPageMostRecentListings - HIT`)
  const sql = "SELECT * FROM fn_getPaginatedMostRecentListings($1, $2)";
  const values = [
    limit_rows,
    offset_rows
  ];

  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get most recent listings (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
    throw 'Unable to get most recent listings'
  })

  var return_result = []
  for (var res in result.rows) {
    logger.debugLog(result.rows[res])
    let order_id = result.rows[res].static_order_id
    let token_id = result.rows[res].token_id
    let contract_address_b16 = result.rows[res].nonfungible_address

    let nft = await token.getToken(
      order_id,
      token_id,
      contract_address_b16
    ).catch((error) => {throw error})

    return_result.push(nft)
  }
  logger.debugLog(return_result)
  return return_result
}

// GIVEN some pagination option, return all recently sold TOKENS
async function GetPageMostRecentSales(limit_rows, offset_rows) {
  logger.infoLog(`MODEL- NFTModel - GetPageMostRecentSales - HIT`)

  const sql = "SELECT * FROM fn_getPaginatedMostRecentSales($1, $2)";
  const values = [
    limit_rows,
    offset_rows
  ];

  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get most recently sold NFTs (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
    throw 'Unable to get most recently sold NFTs'
  })

  var return_result = []
  for (var res in result.rows) {
    logger.debugLog(result.rows[res])
    let order_id = result.rows[res].static_order_id
    let token_id = result.rows[res].token_id
    let contract_address_b16 = result.rows[res].nonfungible_address

    let nft = await token.getToken(
      order_id,
      token_id,
      contract_address_b16
    ).catch((error) => {throw error})

    return_result.push(nft)
  }
  logger.debugLog(return_result)
  return return_result
}


/*
 * SHAPE DATA UTILS
 */


async function DBGetPrimarySalesIfPresent(nonfungible_address) {
  logger.infoLog(`MODEL- NFTModel - DBGetPrimarySalesIfPresent - HIT`)

  const sql = 'SELECT * FROM fn_getNonFungibleLifetimeSalesData($1)'
  const values = [
    nonfungible_address
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get sales data for contract: ${nonfungible_address}: ${error}`)
    throw 'Unable to get sales data for contract'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetPaginatedNonFungibleStats(limit_rows, offset_rows) {
  const sql = 'SELECT * FROM fn_getPaginatedNonFungibleStats($1, $2)'
  const values = [
    limit_rows,
    offset_rows
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get stats for non-fungibles (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
    throw 'Unable to get stats for non-fungibles'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetPaginatedCollectionFloors(limit_rows, offset_rows) {
  logger.infoLog(`API - PUBLIC - GetPaginatedCollectionFloors - HIT`)

  const sql = 'SELECT * FROM fn_getPaginatedCollectionFloors($1, $2)'
  const values = [
    limit_rows,
    offset_rows
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get collection floors (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
    throw 'Unable to get collection floors'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetStatsForNonfungible(nonfungible_address) {
  logger.infoLog(`API - PUBLIC - DBGetStatsForNonfungible - HIT`)

  const sql = 'SELECT * FROM fn_getCollectionStats($1)'
  const values = [
    nonfungible_address
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get stats for contract: ${nonfungible_address}: ${error}`)
    throw 'Unable to get stats for contract'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetGraphForNonFungible(nonfungible_address) {
  logger.infoLog(`API - PUBLIC - DBGetGraphForNonFungible - HIT`)

  const sql = 'SELECT * FROM fn_getPeriodGraphForNonFungible($1, $2, $3)'
  const values = [
    nonfungible_address,
    0,
    3131648330534 // 2069
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get graph data for contract: ${nonfungible_address}: ${error}`)
    throw 'Unable to get graph data for contract'
  })
  logger.debugLog(result.rows)
  return result.rows
}


async function DBGetACollectionRank(contractAddress, timeFrom, timeTo)
{
  logger.infoLog(`FUNC - PUBLIC - getACollectionRank - HIT`)

  const sql = 'SELECT * FROM fn_getSingleCollectionsActivity ($1, $2, $3)'
  const values = [
    contractAddress,
    timeFrom,
    timeTo
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get activity for collection: ${contractAddress} (from: ${timeFrom} to ${timeTo}): ${error}`)
    throw 'Unable to get activity for collection'
  })
  logger.debugLog(result.rows)
  return result.rows
}


async function DBGetAllCollectionRanks(page, limit, timeFrom, timeTo)
{
  logger.infoLog(`FUNC - PUBLIC - getAllCollectionRanks - HIT`)

  const sql = 'SELECT * FROM fn_getCollectionsActivity ($1, $2, $3, $4)'
  const values = [
    limit,
    page,
    timeFrom,
    timeTo
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get collection activities: (L: ${limit}, O: ${page}) (from: ${timeFrom} to: ${timeTo}): ${error}`)
    throw 'Unable to get collection activities'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetPaginatedContractActivity(contract_address, offset_rows, limit_rows)
{
    logger.infoLog(`API - PUBLIC - DBGetPaginatedContractActivity - HIT`)
    
    const sql = 'SELECT * FROM fn_getpaginatedactivityforcontract($1, $2, $3)'
    const values = [
        contract_address,
        limit_rows,
        offset_rows
    ]

    var result = await pgClient.query(sql, values).catch((error) => {
      logger.errorLog(`Unable to get activity for contract: ${contract_address} (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
      throw 'Unable to get activity for contract'
    })
    logger.debugLog(result.rows)
    return result.rows
}

module.exports = {
  GetContract,
  GetContractCollection,
  GetPageListingForNonFungible,
  GetPageSalesForNonFungible,
  GetPageMostRecentListings,
  GetPageMostRecentSales,
  DBGetPrimarySalesIfPresent,
  DBGetPaginatedNonFungibleStats,
  DBGetPaginatedCollectionFloors,
  DBGetStatsForNonfungible,
  DBGetGraphForNonFungible,
  DBGetACollectionRank,
  DBGetAllCollectionRanks,
  DBGetPaginatedContractActivity,
}
