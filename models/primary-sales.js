const logger = require('../logger.js');
const client = require('../utils/expressUtils.js')
const proxyUtils = require('../utils/proxyUtils.js')
const indexer = require('../utils/indexer.js')
const pgClient = client.ReturnPool()
const { toBech32Address } = require('@zilliqa-js/crypto')

// SHOW ME ALL THE PRIMARY SALES W/ PAGINATION

const default_image_uri = '';

/*
 * SHAPE DEFINITION
 */
async function GetPrimarySales(limit, offset)
{
    const primary_sales_db = await DBGetPaginatedProxyContract(limit, offset).catch((error) => {throw error})

    var return_result = []
    for (var res in primary_sales_db) 
    {
        logger.debugLog(primary_sales_db[res])
        const sold_chain = await proxyUtils.GetCurrentPrimaryProxyMintCount(
            primary_sales_db[res].proxy_address
        ).catch((error) => {throw error})
        
        const lifetime_sales = await proxyUtils.GetTotalPrimaryProxyProfit(
            primary_sales_db[res].proxy_address
        ).catch((error) => {throw error})

        const metadata = await indexer.GetMetadataForTokenID(
            primary_sales_db[res].proxy_nonfungible_address,
            1
        ).catch((error) => {throw error})


        proxy_image = metadata ?? null // todo metadata call for nonfungibles
        proxy_currently_mint = lifetime_sales ?? null
        proxy_max_mint = primary_sales_db[res].proxy_max_mint 
        proxy_cost_qa = primary_sales_db[res].proxy_cost_qa 
        proxy_open_block = primary_sales_db[res].proxy_open_block 
        proxy_address_b16  = primary_sales_db[res].proxy_address
        proxy_address_b32  = toBech32Address(primary_sales_db[res].proxy_address)
        nonfungible_address_b16 = primary_sales_db[res].proxy_nonfungible_address
        nonfungible_address_b32 = toBech32Address(primary_sales_db[res].proxy_nonfungible_address)
        beneficiary_address_b16 = primary_sales_db[res].proxy_beneficiary_address
        beneficiary_address_b32 = toBech32Address(primary_sales_db[res].proxy_beneficiary_address)

        primary_obj = {
            proxy_image: proxy_image,
            currently_minted: sold_chain,
            proxy_max_mint: proxy_max_mint,
            proxy_cost_qa: proxy_cost_qa,
            currently_made_qa: lifetime_sales,
            proxy_open_block: proxy_open_block,
            proxy_address_b16 : proxy_address_b16,
            proxy_address_b32: proxy_address_b32,
            nonfungible_address_b16 : nonfungible_address_b16,
            nonfungible_address_b32: nonfungible_address_b32,
            beneficiary_address_b16 : beneficiary_address_b16,
            beneficiary_address_b32: beneficiary_address_b32
        }
      
        return_result.push(primary_obj)
    }
    return return_result
}

async function DBGetPaginatedProxyContract(limit_rows, offset_rows) {
    const sql = 'SELECT * FROM fn_getPaginatedProxyContracts($1, $2)'
    const values = [
      limit_rows,
      offset_rows
    ]
  
    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get paginated data for proxy contract (L: ${limit_rows}, O: ${offset_rows}}): ${error}`)
        throw 'Unable to get data for proxy contract'
    })
    logger.debugLog(result.rows)
    return result.rows
  }

module.exports = {
    GetPrimarySales
}