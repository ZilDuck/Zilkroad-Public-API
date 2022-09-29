const client = require('../utils/expressUtils.js');
const axios = require('axios');
const logger = require('../logger.js')

const testnetString = process.env.is_testnet ? "?network=testnet" : "?"
process.env.is_testnet ? console.log("INDEXER TESTNET") : console.log("INDEXER MAINNET") 
/*
 * HELPER EXPORTED CLASS 
 * ALL OF THE INDEXER CALLS 
 */

module.exports =
{
    // Contract - GetContractDetails
    GetContractDetails: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetContractDetails - HIT`)
        const response = await axios.get(`https://api.zildexr.com/contract/${nft_contract}${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // Contract - GetContractDetails
    GetContractCode: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetContractCode - HIT`)
        const response = await axios.get(`https://api.zildexr.com/contract/${nft_contract}/code${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // Contract - GetContractState
    GetContractState: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetContractState - HIT`)
        const response = await axios.get(`https://api.zildexr.com/contract/${nft_contract}/state${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // Address - GetNFTsForAddress
    GetNFTsForAddress: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetNFTsForAddress - HIT`)
        const response = await axios.get(`https://api.zildexr.com/address/${nft_contract}/nft${testnetString}&details=true&delegated=false`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // Address - GetDeployedContractForAddress
    GetDeployedContractsForAddress: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetDeployedContractsForAddress - HIT`)
        const response = await axios.get(`https://api.zildexr.com/address/${nft_contract}/contract${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // NFT - GetPaginedTokenIDs
    GetPaginatedTokenIDs: async function(nft_contract, limit = 20, page = 1) {
        const response = await axios.get(`https://api.zildexr.com/nft/${nft_contract}${testnetString}&size=${limit}&page=${page}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // NFT - GetTokenID
    GetTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - GetTokenID - HIT`)
        const response = await axios.get(`https://api.zildexr.com/nft/${nft_contract}/${token_id}${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // NFT - RefreshTokenID
    RefreshTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - RefreshTokenID - HIT`)
        const response = await axios.get(`https://api.zildexr.com/nft/${nft_contract}/${token_id}/refresh${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // NFT - GetMetadataForTokenID
    GetMetadataForTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - GetMetadataForTokenID - HIT`)
        const response = await axios.get(`https://api.zildexr.com/nft/${nft_contract}/${token_id}/metadata${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response
    },

    // NFT - GetActionsForTokenID
    GetActionsForTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - GetActionsForTokenID - HIT`)
        const response = await axios.get(`https://api.zildexr.com/nft/${nft_contract}/${token_id}/actions${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } })
        return response.data
    },

    // NFT - GetStatisticsForMetadata
    GetStatisticsForMetadata: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetStatisticsForMetadata - HIT`)
        const response = await axios.get(`https://api.zildexr.com/contract/${nft_contract}/attributes${testnetString}`,
                                        { headers: { "X-API-KEY": client.indexApiKey } });
        return response
    },
}
