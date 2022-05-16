const logger = require('../logger.js');
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()
const { toBech32Address, fromBech32Address } = require('@zilliqa-js/crypto')
const { DBGetVerifiedStatusForNonFungible } = require('./common.js')
const { ResolveZilDomain } = require("../DomainResolver.js");
const nftUtils = require('../utils/nftUtils.js')
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

    if(queryString.startsWith(`zil1`))
    {
        queryString = fromBech32Address(queryString)
    }
    var searchResult;
    if(isAddress)
    {
        console.log(await isUser(queryString))
        if(await isUser(queryString))
        {

        }
        else
        {
            console.log(`searching for user`)
            searchResult = getSearchForUser(queryString)
            console.log(`searching for contract `)
            searchResult = getSearchForContract(queryString)
        }

    }
    if(isZNS)
    {
        console.log(`searching for ZNS`)
        searchResult = getSearchForZNS(queryString)
    }
    if(isFreeSearch)
    {
        console.log(`searching for freetext`)
        searchResult = getSearchForFreetext(queryString)
    }
    return searchResult;    
}


async function isUser(address)
{
    try{
        const balance = await client.zilliqa.blockchain.getBalance(address);

        if (typeof(balance.result.nonce) === 'undefined') 
        {
            return false;
        }
        if(balance.result.nonce > 1) return false;
        else return false; 
    }
    catch(e)
    {
        console.log(e)
    }
}


async function getSearchForUser(address)
{
    const user_b32 = toBech32Address(address)
    return ReturnSearch(user_b32, user_b32, `/wallet/${user_b32}`, false)
}

async function getSearchForContract(address)
{
    const contract_b32 = toBech32Address(address)
    const db_verified = await DBGetVerifiedStatusForNonFungible(address)
    console.log(db_verified + 'fuck')

    return ReturnSearch(nftUtils.GetTokenName(contract_b32), contract_b32, `/collections/${contract_b32}`, !!db_verified)
}

async function getSearchForZNS(zns)
{
    const user_b16 = await GetAddressFromDotZilDomain(zns)
    const user_b32 = toBech32Address(user_b16)
    return ReturnSearch(zns, user_b32, `/wallet/${user_b32}`, false)
}

async function getSearchForFreetext(freetext)
{
    try{
    logger.infoLog(`MODEL - SearchModel - GetPaginatedSearchForString - HIT`)
    const limit_rows = 15;
    const offset_rows = 0;

    logger.debugLog(`got search query ${freetext}`)

    const sql = 'SELECT * FROM fn_getPaginatedSearchForString($1, $2, $3)'
    const values = [
        freetext,
        limit_rows,
        offset_rows
    ]

    logger.debugLog(`calling ${sql}, with ${values}`)
    var query = await pgClient.query(sql, values)
    logger.debugLog(query.rows)

    var resultArray = [];
    for(var result in query.rows)
    {
        console.log(`hi` + query.rows[result].nonfungible_address)
        const db_verified = await DBGetVerifiedStatusForNonFungible(query.rows[result].nonfungible_address)
        const address = toBech32Address(query.rows[result].nonfungible_address)
        const name = query.rows[result].nonfungible_name
        const row = ReturnSearch(name, address, `/collections/${address}`, !!db_verified)
        resultArray.push(row);
        
    }
    console.table(resultArray)
    return resultArray;
}
catch(e)
{
    console.log(e)
}
}


/*
* Given a test.zil domain, looksup the domain and inserts it into db for lookup
*/
async function GetAddressFromDotZilDomain(zns)
{
    logger.infoLog(`MODEL - SearchModel - GetAddressFromDotZilDomain - HIT`)

    var data = await ResolveZilDomain(user_address);
    if(typeof(data.records) != "undefined")
    {
        logger.debugLog(JSON.stringify(data.records["crypto.ZIL.address"]))

        const sql = 'SELECT * FROM fn_insertDomainLookup($1, $2)'
        const values = [
            user_address, 
            data.records["crypto.ZIL.address"]
        ]
        logger.debugLog(`calling ${sql}, with ${values}`)

        await pgClient.query(sql, values)

       return data.records["crypto.ZIL.address"]
    }
    else
    {
        client.warnLog(`MODEL - SearchModel - GetAddressFromDotZilDomain - no address found for ${zns}`)
    }
}

module.exports = {
    SearchString
}