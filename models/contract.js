const { toBech32Address, fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const indexer = require('../utils/indexer.js')
const logger = require('../logger')
const utils = require('../utils/nftUtils.js')
const axios = require('axios')

//other shapes
const token = require('./token.js')
const { DBGetVerifiedStatusForNonFungible } = require('./common.js')
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
  const indexer_state = await indexer.GetContractState(contract_address_b16).catch((error) => console.log(error))
  logger.debugLog(indexer_state.data)
  const indexer_metadata = await indexer.GetStatisticsForMetadata(contract_address_b16).catch((error) => console.log(error))
  const db_primary_sales = await DBGetPrimarySalesIfPresent(contract_address_b16).catch((error) => console.log(error))
  const api_metadata = await APIGetNFTCollectionHeader(contract_address_b16).catch((error) => console.log(error))
  const db_floors = await DBGetPaginatedCollectionFloors(0, 20).catch((error) => console.log(error))
  const db_stats = await DBGetStatsForNonfungible(contract_address_b16).catch((error) => console.log(error))
  const db_graph = await DBGetGraphForNonFungible(contract_address_b16).catch((error) => console.log(error))
  const db_verified = await DBGetVerifiedStatusForNonFungible(contract_address_b16).catch((error) => console.log(error))

  const contract_name = indexer_state.data.token_name
  const contract_symbol = indexer_state.data.token_symbol
  const user_defined_metadata = api_metadata
  const aggregated_contract_metadata = indexer_metadata.data
  const contract_owner = indexer_state.data.contract_owner
  const royalty_recipient = indexer_state.data.royalty_recipient
  const royalty_bps = indexer_state.data.royalty_fee_bps
  const is_verified = db_verified ?? false
  const nfts_minted = indexer_state.data.total_supply
  const token_balances = indexer_state.data.balances
  const floor_prices = db_floors
  const volume_over_time = db_graph
  const sales_history = db_stats
  const primary_sales = db_primary_sales

  return {
    contract_address_b16,
    contract_address_b32,
    contract_name,
    contract_symbol,
    user_defined_metadata,
    aggregated_contract_metadata,
    contract_owner,
    royalty_recipient,
    royalty_bps,
    is_verified,
    nfts_minted,
    token_balances,
    floor_prices,
    volume_over_time,
    sales_history,
    primary_sales,
  };
}

/*
 * SHAPE CREATORS
 */

//GIVEN a contact and page options, return listed TOKENS
async function GetPageListingForNonFungible(nonfungible_address, limit_rows, offset_rows) {
  logger.infoLog(`API - PUBLIC - GetPageListingForNonFungible - HIT`)

  const sql = 'SELECT * FROM fn_getPaginatedListingForNonFungible($1, $2, $3)'
  const values = [
    nonfungible_address,
    limit_rows,
    offset_rows
  ]

  var result = await pgClient.query(sql, values)
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
    )

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

  var result = await pgClient.query(sql, values)
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
    )

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

  var result = await pgClient.query(sql, values)
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
    )

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

  var result = await pgClient.query(sql, values)
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
    )

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

  const sql = 'SELECT * FROM fn_getVerifiedStatusForNonFungible($1)'
  const values = [
    nonfungible_address
  ]
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetPaginatedNonFungibleStats(limit_rows, offset_rows) {
  const sql = 'SELECT * FROM fn_getPaginatedNonFungibleStats($1, $2)'
  const values = [
    limit_rows,
    offset_rows
  ]
  var result = await pgClient.query(sql, values)
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
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetStatsForNonfungible(nonfungible_address) {
  logger.infoLog(`API - PUBLIC - DBGetStatsForNonfungible - HIT`)

  const sql = 'SELECT * FROM fn_getstatsfornonfungible($1)'
  const values = [
    nonfungible_address
  ]
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetGraphForNonFungible(nonfungible_address) {
  logger.infoLog(`API - PUBLIC - DBGetGraphForNonFungible - HIT`)

  const now = parseInt((new Date().getTime() / 1000).toFixed(0))
  var date = new Date();
  const lastYear = date.setFullYear(date.getFullYear() - 1);

  const sql = 'SELECT * FROM fn_getPeriodGraphForNonFungible ($1, $2, $3)'
  const values = [
    nonfungible_address,
    lastYear,
    now
  ]
  var result = await pgClient.query(sql, values)
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
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}

//
/*
	_limit_rows numeric,
	_offset_rows numeric,
  _time_from int8,
	_time_to int8
*/
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
  var result = await pgClient.query(sql, values)
  logger.debugLog(result.rows)
  return result.rows
}

async function APIGetNFTCollectionHeader(nonfungible_address) {
  logger.infoLog(`FUNC - PUBLIC - APIGetNFTCollectionHeader - HIT`)
  const metadata_filename = 'metadata.json'
  const fallback_filename = '1'

  const response = await client.zilliqa.blockchain.getSmartContractSubState(
    nonfungible_address,
    'base_uri',
  );

  if (response.data === undefined) {
    // nothing to catch here, we dont know where the token is
    logger.warnLog(`can't fetch user defined metadata for collection ${nonfungible_address}`)
    return
  }
  if (response.result) {
    logger.debugLog(project_metadata_uri + metadata_filename)
    var metadata_result = axios.get(project_metadata_uri + metadata_filename)
      .then(function (response) {
        // handle success
        logger.debugLog(response.data);
        return response.data
      })
      .catch(function (error) {
        //client.Return400ErrorCallback('{error : GetNFTCollectionHeader, details : NoMetadataFoundAtBaseURIForContract}', res)
        logger.debugLog(`no hit at metadata.json`);
      })
    console.log(`FUCK ${metadata_result}`)
    return metadata_result
  }
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
  APIGetNFTCollectionHeader
}