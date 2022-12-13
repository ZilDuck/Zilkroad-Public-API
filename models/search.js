const logger = require('../logger.js');
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const { toBech32Address, fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
const { DBGetVerifiedStatusForNonFungible } = require('./common.js')
const { ResolveZilDomain } = require("../DomainResolver.js");
const nftUtils = require('../utils/nftUtils.js')

const bunnyCDNImagePrefix = process.env.is_testnet ? `https://zildexr-testnet.b-cdn.net/` : `https://zildexr.b-cdn.net/`
// GIVEN WE HAVE A SEARCH QUERY, RETURN A SEARCH PARAM.

// NFT CONTRACT
// USER ADDRESS

// ZNS
// NFT SYMBOL
// NFT NAME

/*
* SHAPE DEFINITION
*/ 
function ReturnSearch(result_text, result_image, result_action, is_verified)
{
  return {
    result_text,
    result_image,
    result_action,
    is_verified
  }
}


async function SearchString(queryString)
{
  logger.infoLog(`MODEL - SearchModel - SearchString - HIT - Checking queryString ${queryString}`)
  //does it look like an address?
  const isAddress = (queryString.length == 42 && queryString.startsWith(`0x`) || queryString.startsWith(`zil1`))
  //does it end with .zil? 
  const isZNS = (queryString.length >= 5 && queryString.endsWith(`.zil`))
  //else treat it as text freesearch in the DB 
  const isFreeSearch = (!isZNS && !isAddress)

  var searchResult;

  if(queryString.startsWith(`zil1`)){
    queryString = fromBech32Address(queryString)
  }

  if(isAddress){
    if(await isUser(queryString).catch((error) => {throw error})){
      logger.debugLog(`searching for user`)
      searchResult = getSearchForUser(queryString)
    } else {
      logger.debugLog(`searching for contract `)
      searchResult = getSearchForContract(queryString)
    }
  }

  if(isZNS){
    logger.debugLog(`searching for ZNS`)
    searchResult = getSearchForZNS(queryString)
  }
  
  if(isFreeSearch){
    logger.debugLog(`searching for freetext`)
    searchResult = getSearchForFreetext(queryString)
  }

  return searchResult;    
}


async function isUser(address)
{
  const balance = await client.zilliqa.blockchain.getBalance(address).catch((error) => {
    logger.errorLog(`Unable to get balance for user: ${balance}: ${error}`)
    throw 'Unable to get balance'
  })
  return !!balance.result?.nonce;
}

async function getSearchForUser(address)
{
  const user_b32 = toBech32Address(address)
  //generate user favicon as image - Base64encode transmit?
  return ReturnSearch(user_b32, user_b32, `/wallet/${user_b32}`, false)
}

async function getSearchForContract(address)
{
  const contract_b32 = toBech32Address(address)
  const db_verified = await DBGetVerifiedStatusForNonFungible(address).catch((error) => {throw error})

  return ReturnSearch(
    await nftUtils.GetTokenName(contract_b32).catch((error) => {throw error}),
    await getBunnyImageForContract(contract_b32),
    `/collections/${contract_b32}`,
    !!db_verified
  )
}

async function getSearchForZNS(zns)
{
  const user_b16 = await GetAddressFromDotZilDomain(zns).catch((error) => {throw error})
  const user_b32 = toBech32Address(user_b16)
  return ReturnSearch(zns, user_b32, `/wallet/${user_b32}`, false)
}

async function getSearchForFreetext(freetext)
{
  logger.infoLog(`MODEL - SearchModel - GetPaginatedSearchForString - HIT`)
  const limit_rows = 15;
  const offset_rows = 0;

  logger.debugLog(`got search query ${freetext}`)

  let search_term = freetext + ":*"
  const sql = 'SELECT * FROM fn_getPaginatedSearchForString($1, $2, $3, $4)'
  const values = [
    freetext,
    search_term,
    limit_rows,
    offset_rows
  ]

  var query = await pgClient.query(sql, values).catch((error) => {
    logger.errorLog(`Unable to perform free text search (FT: ${freetext}, ST: ${search_term}) (L: ${limit_rows}, O: ${offset_rows}): ${error}`)
    throw 'Unable to perform free text search'
  })
  logger.debugLog(query.rows)
  query.rows.forEach(function(object) {
    object.contract_address_b32 = validation.isBech32(object.nonfungible_address) ? object.nonfungible_address : toBech32Address(object.nonfungible_address)
    object.result_action = '/collections/' + object.contract_address_b32
  })

  return query.rows;
}


/*
* Given a test.zil domain, looksup the domain and inserts it into db for lookup
*/
async function GetAddressFromDotZilDomain(zns)
{
  logger.infoLog(`MODEL - SearchModel - GetAddressFromDotZilDomain - HIT`)

  var data = await ResolveZilDomain(user_address)
  if(typeof(data.records) != "undefined") {
    logger.debugLog(JSON.stringify(data.records["crypto.ZIL.address"]))

    const sql = 'SELECT * FROM fn_insertDomainLookup($1, $2)'
    const values = [
      user_address, 
      data.records["crypto.ZIL.address"]
    ]
    logger.debugLog(`calling ${sql}, with ${values}`)

    await pgClient.query(sql, values).catch((error) => {
      logger.errorLog(`Unable to insert domain lookup for address: ${user_address} on ${data.records["crypto.ZIL.address"]}: ${error}`)
      throw 'Unable to insert domain lookup'
    })

    return data.records["crypto.ZIL.address"]
  } else {
    client.errorLog(`MODEL - SearchModel - GetAddressFromDotZilDomain - no address found for ${zns}`)
    throw 'Unable to find user from zns domain'
  }
}

function getSearchFallback( query ) {
  const result = ReturnSearch(`No results for ${query.toString()}`, '', '', false)
  logger.debugLog(result)
  return result
}

async function getBunnyImageForContract(b16_contract)
{
  return bunnyCDNImagePrefix.concat(b16_contract)
}

module.exports = {
  SearchString,
  getSearchFallback
}
