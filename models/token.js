const { Zilliqa, toBech32Address, fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const indexer = require('../utils/indexer.js')
const logger = require('../logger')
const zilliqa = new Zilliqa(process.env.current_network)
const addressUtil = require('../utils/addressUtils.js')
const { DBGetVerifiedStatusForNonFungible } = require('./common.js')
const { GetPaginatedTokenIDs } = require('../utils/indexer')

/*
 * SHAPE DEFINITION
 */ 
async function GetTokenCollection(nonfungible_tokenid_address_array) {
  logger.infoLog(`MODEL - NFTModel - GetCollection - HIT`)
  const response = await Promise.all(nonfungible_address_array.map(x => getToken(null, x.token_id.toString(), x.contract_address_b16.toString())))
  return response
}

/**
 *
 * @param token_id
 * @param contract_address bech16|bech32
 * @return {Promise<{contract_symbol: (*|RemoteObject|string|boolean), contract_name: (*|boolean), owner_address: (*|boolean), is_verified: (*|void|boolean), royalty_bps: (*|boolean), volume_over_time_graph: (*|void|boolean), token_resource_uri: (*|boolean), token_id, contract_address_b32: string, token_actions: (*|boolean), contract_address_b16: string, listing: (*|{fungible_address_b32: string, static_order_id: *, fungible_symbol: *, fungible_address_b16: *, fungible_amount: *, fungible_decimals: *, listing_tx: *, listing_user_b16: *, fungible_name: *, token_id: *, listing_user_b32: string, contract_address_b32: string, contract_address_b16: *, listing_block: *, listing_unix: *}|boolean), order_id, token_metadata: (*|MediaMetadata|boolean), token_sales_history: (*|void|boolean)}>}
 */
async function getToken(
  token_id,
  contract_address
) {

  let contract_address_b16
  try {
    contract_address_b16 = addressUtil.NormaliseAddressToBase16(contract_address)
  } catch (error) {
    throw error
  }

  logger.infoLog(`MODEL - TokenModel - getToken - HIT - ${token_id + contract_address_b16}`)
  const indexer_token = await indexer.GetTokenID(contract_address_b16, token_id).then(r => r.data).catch((error) => {throw error})
  const db_verified = await DBGetVerifiedStatusForNonFungible(contract_address_b16).catch((error) => {throw error})
  const sales_data = await DBGetNonFungibleTokenSalesData(contract_address_b16, token_id).catch((error) => {throw error})

  const sales_count = sales_data[0]?.lifetime_quantity_sold ?? 0
  const sales_volume = sales_data[0]?.lifetime_sales_usd ?? 0

  //this is also butters, but what are you gonna do about it
  var sales_history = await DBGetNonFungibleTokenSaleHistory(contract_address_b16, token_id).catch((error) => {throw error})
  for (var sales in sales_history)
  {
    sales_history[sales].seller = toBech32Address(sales_history[sales].seller)
    sales_history[sales].buyer = toBech32Address(sales_history[sales].buyer)
  }
  logger.debugLog(sales_history)

  const graph_data = await DBGetPeriodGraphForNonFungibleToken(contract_address_b16, token_id).catch((error) => {throw error})

  contract_name = indexer_token.name ?? false
  contract_symbol = indexer_token.symbol ?? false
  owner_address = indexer_token.owner ?? false

  token_resource_uri = indexer_token.resources ?? false
  token_metadata = indexer_token.metadata ?? false
  const verified = db_verified.length > 0

  return {
    token_id,
    contract_address_b16,
    contract_address_b32: toBech32Address(contract_address_b16),
    contract_name,
    contract_symbol,
    owner_address_b16: owner_address,
    owner_address_b32: toBech32Address(owner_address),
    token_resource_uri,
    token_metadata,
    sales_count,
    sales_volume,
    sales_history,
    graph_data,
    verified
  }
}

async function getTokenCard(
  order_id,
  token_id,
  contract_address
) {

  let contract_address_b16
  try {
    contract_address_b16 = addressUtil.NormaliseAddressToBase16(contract_address)
  } catch (error) {
    throw error
  }

  logger.infoLog(`MODEL - TokenModel - getTokenCard - HIT - ${order_id + token_id + contract_address_b16}`)

  const indexer_token = await indexer.GetTokenID(contract_address_b16, token_id).catch((error) => {throw error})
  const db_verified = await DBGetVerifiedStatusForNonFungible(contract_address_b16).catch((error) => {throw error})
  const verified = db_verified.length > 0
  const listing_data = await GetListing(order_id)

  let indexer_token_data
  typeof indexer_token.data !== undefined ? indexer_token_data = indexer_token.data : indexer_token_data = {}
  let contract_name = indexer_token_data.name ?? false
  let contract_symbol = indexer_token_data.symbol ?? false
  let owner_address = indexer_token_data.owner ?? false
  let is_verified = db_verified ?? false
  let token_resource_uri = indexer_token_data.resources ?? false
  let listing = listing_data ?? false

  return {
    order_id,
    token_id,
    contract_address_b16,
    contract_address_b32 : toBech32Address(contract_address_b16),
    contract_name,
    contract_symbol,
    owner_address,
    is_verified,
    token_resource_uri,
    listing,
    verified
  }
}


/**
 * Get a list of nfts.
 *
 * @param filter
 * @param limit
 * @param page
 * @param order
 * @param orderBy
 * @param query
 * @return {Promise<*[]>}
 */
async function getTokens(filter, limit, page, order, orderBy, contract_address) {
  let db_result = []
  let tokenList = []

  switch (filter) {
    case 'featured':
      // get the (collection address & token id & order id) for 4 nfts - top homepage section
      db_result = await DBGetRandomVerifiedListedNonFungible().catch((error) => {throw error})
      break
    case 'recently-listed':
      // get the (collection address & token id  & order id) for 10 nfts - homepage recently listed section
      db_result = await DBGetPaginatedMostRecentListings(limit, page).catch((error) => {throw error})
      break
    case 'recently-sold':
      // get the (collection address & token id  & order id) for 6 nfts - homepage recently sold section
      db_result = await DBGetPaginatedMostRecentlySold().catch((error) => {throw error})
      break
    case 'contract-listed':
      db_result = await DBGetPaginatedListedTokensForContract(contract_address, limit, page).catch((error) => {throw error})
  }

  const nfts = await Promise.all(
    db_result.map(async ({
        static_order_id,
        nonfungible_address,
        token_id,
        listing_fungible_token_price,
        fungible_symbol,
        decimals,
        verified,
        fungible_address
      }) => {
        let contract_address_b16
        try {
          contract_address_b16 = addressUtil.NormaliseAddressToBase16(nonfungible_address)
        } catch (error) {
          throw error
        }
        const indexer_token = await indexer.GetTokenID(contract_address_b16, token_id).then(res => (res.data)).catch((error) => {throw error}) // TODO Shouldn't have an api call in a loop like this. Need a batch method or listing data from indexer?
        const indexer_contract_data = await indexer.GetContractState(contract_address_b16).catch((error) => {throw error})

        return {
          order_id: static_order_id,
          collection_name: indexer_token.name,
          current_owner: indexer_token.owner,
          symbol: indexer_token.symbol,
          contract_address_b16,
          contract_address_b32: toBech32Address(contract_address_b16),
          token_id: token_id,
          royalty_bps: indexer_contract_data.data.royalty_fee_bps ?? 0,
          token_price: listing_fungible_token_price,
          fungible_address: fungible_address,
          token_symbol: fungible_symbol,
          decimals: decimals,
          verified: verified
        }
      }
    )
  )

  const totalPages = Math.ceil(nfts.length / limit)
  const appData = {
    nfts,
    pagination: {
      'size': limit,
      'page': page,
      'total_pages': totalPages,
      'total_elements': nfts.length
    }
  }

  return appData
}

async function GetTokenSpender(tokenId, contractAddress)
{
  const spenders = await zilliqa.blockchain.getSmartContractSubState(
    contractAddress,
    'spenders',
    [tokenId],
  ).catch((error) => {
    logger.errorLog(`Unable to get spenders for contract: ${contractAddress} with tokens: ${tokenId}: ${error}`)
    throw 'Unable to get spenders for contract'
  })
  if (spenders.result) {
    return spenders.result?.spenders[tokenId]
  } else return false
}

async function GetTokenAllowance(contractAddress, userAddress)
{
  const allowances = await zilliqa.blockchain.getSmartContractSubState(
    contractAddress,
    'allowances',
    [userAddress]
  ).catch((error) => {
    logger.errorLog(`Unable to get allowances for contract: ${contractAddress} with users: ${userAddress}: ${error}`)
    throw 'Unable to get allowances for contract'
  })

  if (allowances.result) {
    return allowances.result?.allowances[userAddress]
  } else return {}
}

async function getContractNfts(contractAddress, filter, limit, page, order, orderBy) {
  const indexerData = await GetPaginatedTokenIDs(contractAddress, limit, page).then(response => response).catch((error) => {throw error})

  // this is butters but im so brain dead atm
  const _contract_address = validation.isBech32(contractAddress) ? fromBech32Address(contractAddress) : contractAddress
  const db_verified = await DBGetVerifiedStatusForNonFungible(_contract_address).catch((error) => {throw error})
  const verified = db_verified.length > 0

  const appData = {
    nfts: indexerData.data.map(({ name, symbol, contract, tokenId }) => ({
      collection_name: name,
      symbol,
      contract_address_b16: validation.isBech32(contract) ? fromBech32Address(contract) : contract,
      contract_address_b32: validation.isBech32(contract) ? contract : toBech32Address(contract),
      token_id: tokenId,
      verified: verified
    })),
    pagination: indexerData.headers['x-pagination']
  }

  let token_ids = indexerData.data.map(({tokenId}) => {return tokenId});
  let min_token_id = Math.min.apply( null, token_ids );
  let max_token_id = Math.max.apply( null, token_ids );
  let token_prices = await DBGetListedTokenPricesForCollectionRange(contractAddress, min_token_id, max_token_id).catch((error) => {throw error})
  appData.nfts.map(function (nft) {
    for ( const result of token_prices ) {
      if ( result.token_id == nft.token_id ) {
        nft.token_price = result.listing_fungible_token_price
        nft.token_symbol = result.fungible_symbol
        nft.decimals = result.decimals
      }
    }
  })
  return appData
}

async function getContractListedNfts(contractAddress, limit, page) {
  const db_result = await DBGetPaginatedListedTokensForContract(contractAddress, limit, page).catch((error) => {throw error})
  let nfts = []
  for ( const result of db_result ) {
    nfts.push({
      collection_name: result.collection_name,
      symbol: result.symbol,
      contract_address_b16: contractAddress,
      contract_address_b32: validation.isBech32(contractAddress) ? contractAddress : toBech32Address(contractAddress),
      token_id: result.token_id
    })
  }
  return {
    nfts: nfts
  }
}

async function getUserNfts(walletAddress, limit = 16, page = 1) {
  let owner_address_b16
  try {
    owner_address_b16 = addressUtil.NormaliseAddressToBase16(walletAddress)
  } catch (error) {
    throw error
  }
  
  let owner_address_b32 = toBech32Address(owner_address_b16)

  const indexerData = await indexer.GetNFTsForAddress(walletAddress, false).then(response => response).catch((error) => {throw error})
  let nfts = []
  for (const contract of indexerData.data) {
    for (const nft of contract.nfts) {
      let contract_address_b16
      try {
        contract_address_b16 = addressUtil.NormaliseAddressToBase16(walletAddress)
      } catch (error) {
        throw error
      }
      let contract_address_b32 = toBech32Address(contract_address_b16)
      let indexer_contract_data = await indexer.GetContractState(contract_address_b16).catch((error) => {throw error})    
      nfts.push({
        collection_name: nft.name,
        symbol: nft.symbol,
        contract_address_b16: contract_address_b16,
        contract_address_b32: contract_address_b32,
        owner_address_b16: owner_address_b16,
        owner_address_b32: owner_address_b32,
        royalty_bps: indexer_contract_data.data.royalty_fee_bps ?? 0,
        token_id: nft.tokenId
      })
    }
  }
  const totalPages = nfts.length / limit
  const totalNfts = nfts.length
  nfts = paginate(nfts, limit, page)
  const appData = {
    total: totalNfts,
    nfts,
    pagination: {
      'size': limit,
      'page': page,
      'total_pages': totalPages,
      'total_elements': nfts.length
    }
  }
  return appData
}

async function getUserListedNfts(listings, walletAddress, limit = 16, page = 1) {
  const indexerData = await indexer.GetNFTsForAddress(walletAddress, true).then(response => response).catch((error) => {throw error})
  let nfts = []
  for (const contract of indexerData.data) {
    for (const listing of listings) {
      for (const nft of contract.nfts) {
        if (listing.nonfungible_address.toLowerCase() == nft.contract.toLowerCase() && listing.token_id == nft.tokenId) {
          nfts.push({
            collection_name: nft.name,
            symbol: nft.symbol,
            contract_address_b16: validation.isBech32(nft.contract) ? fromBech32Address(nft.contract) : nft.contract,
            contract_address_b32: validation.isBech32(nft.contract) ? nft.contract : toBech32Address(nft.contract),
            owner_address_b16: validation.isBech32(walletAddress) ? fromBech32Address(walletAddress) : walletAddress,
            owner_address_b32: validation.isBech32(walletAddress) ? walletAddress : toBech32Address(walletAddress),
            token_id: nft.tokenId,
            token_price: listing.listing_fungible_token_price,
            token_symbol: listing.fungible_symbol,
            decimals: listing.decimals,
            verified: listing.verified,
            listing
          })
        }
      }
    }
  }
  const totalPages = nfts.length / limit
  nfts = paginate(nfts, limit, page)
  const appData = {
    nfts,
    pagination: {
      'size': limit,
      'page': page,
      'total_pages': totalPages,
      'total_elements': nfts.length
    }
  }
  return appData
}

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size)
}

/*
 * SHAPE CREATORS
 */
async function GetRandomVerifiedListedNFT() {
  var return_result = []
  const db_result = await DBGetRandomVerifiedListedNonFungible().catch((error) => {
    logger.errorLog(`Unable to get random verified listed NFTs: ${error}`)
    throw 'Unable to get random verified listed NFTs'
  })
  
  for (var res in db_result) {
    logger.debugLog(res)
    let order_id = db_result[res].static_order_id
    let token_id = db_result[res].token_id
    let contract_address_b16 = db_result[res].nonfungible_address

    let nft = await getTokenCard(
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
async function DBGetPeriodGraphForNonFungibleToken(nft_contract, token_id) {
  logger.infoLog(`MODEL- NFTModel - DBGetPeriodGraphForNonFungibleToken - HIT`)
  const year_2069 = 3131648330534 // in epoch format

  const sql = 'SELECT * FROM fn_getPeriodGraphForNonFungibleToken($1, $2, $3, $4)'
  const values = [
    nft_contract,
    token_id,
    0,
    year_2069
  ]

  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get graph data for token id: ${token_id} from contract: ${nft_contract}: ${error}`)
    throw 'Unable to get graph data for token from contract'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetNonFungibleTokenSalesData(nft_contract, token_id) {
  logger.infoLog(`MODEL- NFTModel - DBGetNonFungibleTokenSalesData - HIT`)

  const sql = 'SELECT * FROM fn_getNonFungibleTokenSalesData($1, $2)'
  const values = [
    nft_contract,
    token_id
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get sales data for token id: ${token_id} from contract: ${nft_contract}: ${error}`)
    throw 'Unable to get sales data for token from contract'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetNonFungibleTokenSaleHistory(nft_contract, token_id) {
  const sql = 'SELECT * FROM fn_getNonFungibleTokenSalesHistory($1, $2)'
  const values = [
    nft_contract,
    token_id
  ]
  var result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get sale history for token id: ${token_id} from contract: ${nft_contract}: ${error}`)
    throw 'Unable to get sale history for token from contract'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetRandomVerifiedListedNonFungible() {
  logger.infoLog(`FUNC - PUBLIC - DBGetRandomVerifiedListedNonFungible - HIT`)
  var result = await pgClient.query('SELECT * FROM fn_getRandomVerifiedListedNonFungible()').catch((error) => {
    logger.errorLog(`Unable to get random verified listings: ${error}`)
    throw 'Unable to get random verified listings'
  })
  logger.debugLog(result.rows)
  return result.rows
}

async function DBGetPaginatedMostRecentListings(limitRows, offsetRows) {
  const sql = 'SELECT * FROM fn_getPaginatedListingForRecent($1, $2)'
  const values = [
    limitRows,
    offsetRows
  ]
  const result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get most recent listings (L: ${limitRows}, O: ${offsetRows}): ${error}`)
    throw 'Unable to get most recent listings'
  })
  return result.rows
}

async function DBGetPaginatedMostRecentlySold(limitRows, offsetRows) {
  const sql = 'SELECT * FROM fn_getPaginatedSalesForAllRecentContracts($1, $2)'
  const values = [
    limitRows,
    offsetRows
  ]
  const result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get most recent sold nfts (L: ${limitRows}, O: ${offsetRows}): ${error}`)
    throw 'Unable to get most recent sold nfts'
  })
  return result.rows
}

async function DBGetPaginatedListedTokensForContract(contractAddress, limitRows, offsetRows) {
  const sql = 'SELECT * FROM fn_getPaginatedListedTokensForContract($1, $2, $3)'
  const values = [
    contractAddress,
    limitRows,
    offsetRows
  ]
  const result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get listed tokens for contract: ${contractAddress} (L: ${limitRows}, O: ${offsetRows}): ${error}`)
    throw 'Unable to get listed tokens for contract'
  })
  return result.rows
}

async function DBGetListedTokenPricesForCollectionRange(contractAddress, min_token_id, max_token_id) {
  const sql = 'SELECT * FROM fn_getListedTokensForCollectionRange($1, $2, $3)'
  const values = [
    contractAddress,
    min_token_id,
    max_token_id
  ]
  const result = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to get listed tokens for collection: ${contractAddress} in range: ${min_token_id}-${max_token_id}: ${error}`)
    throw 'Unable to get listed tokens for collection with a given range'
  })
  return result.rows
}

module.exports = {
  getToken,
  getTokens,
  getContractNfts,
  getContractListedNfts,
  getUserNfts,
  getUserListedNfts,
  GetRandomVerifiedListedNFT,
  GetTokenSpender,
  GetTokenAllowance
}
