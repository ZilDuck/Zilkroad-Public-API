const client = require('../utils/expressUtils.js');
const axios = require('axios');
const logger = require('../logger.js')

const testnetString = process.env.is_testnet ? "?network=testnet" : "?"
/*
 * HELPER EXPORTED CLASS 
 * ALL OF THE INDEXER CALLS 
 */

module.exports =
{
    // Contract - GetContractDetails
    GetContractDetails: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetContractDetails - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/contract/${nft_contract}${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get contract details for contract address: ${nft_contract}: ${error}`)
          throw 'Unable to get contract details'
        })
        return response
    },

    // Contract - GetContractDetails
    GetContractCode: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetContractCode - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/contract/${nft_contract}/code${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get contract code for contract address: ${nft_contract}: ${error}`)
          throw 'Unable to get contract code'
        })
        return response
    },

    // Contract - GetContractState
    GetContractState: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetContractState - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/contract/${nft_contract}/state${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        )
        .catch((error) => {
          logger.errorLog(`Unable to get contract state for contract address: ${nft_contract}: ${error}`)
          throw 'Unable to get contract state'
        })
        return response
    },

    // Address - GetNFTsForAddress
    GetNFTsForAddress: async function(nft_contract, delegated = true) {
        logger.infoLog(`FUNC - INDEXER - GetNFTsForAddress - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/address/${nft_contract}/nft${testnetString}&details=true&delegated=${delegated}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get nfts for contract address: ${nft_contract} (delegated: ${delegated}): ${error}`)
          throw 'Unable to get nfts for contract address'
        })
        return response
    },

    // Address - GetDeployedContractForAddress
    GetDeployedContractsForAddress: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetDeployedContractsForAddress - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/address/${nft_contract}/contract${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get deployed contracts for contract address: ${nft_contract}: ${error}`)
          throw 'Unable to get deployed contracts for contract'
        })
        return response
    },

    // NFT - GetPaginedTokenIDs
    GetPaginatedTokenIDs: async function(nft_contract, limit = 20, page = 1) {
        const response = await axios.get(
          `https://api.zildexr.com/nft/${nft_contract}${testnetString}&size=${limit}&page=${page}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get tokens for contract address: ${nft_contract} (L: ${limit}, O: ${page}): ${error}`)
          throw 'Unable to get tokens for contract'
        })
        return response
    },

    // NFT - GetTokenID
    GetTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - GetTokenID - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/nft/${nft_contract}/${token_id}${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get token id: ${token_id} from contract: ${nft_contract}: ${error}`)
          throw 'Unable to get token from contract'
        })
        return response
    },

    // NFT - RefreshTokenID
    RefreshTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - RefreshTokenID - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/nft/${nft_contract}/${token_id}/refresh${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to refresh token id: ${token_id} from contract: ${nft_contract}: ${error}`)
          throw 'Unable to refresh token from contract'
        })
        return response
    },

    // NFT - GetMetadataForTokenID
    GetMetadataForTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - GetMetadataForTokenID - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/nft/${nft_contract}/${token_id}/metadata${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get metadata for token id: ${token_id} from contract: ${nft_contract}: ${error}`)
          throw 'Unable to get metadata for token from contract'
        })
        return response
    },

    // NFT - GetActionsForTokenID
    GetActionsForTokenID: async function(nft_contract, token_id) {
        logger.infoLog(`FUNC - INDEXER - GetActionsForTokenID - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/nft/${nft_contract}/${token_id}/actions${testnetString}`,
          { headers: { 'X-API-KEY': client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get actions for token id: ${token_id} from contract: ${nft_contract}: ${error}`)
          throw 'Unable to get actions for token from contract'
        })
        return response.data
    },

    // NFT - GetStatisticsForMetadata
    GetStatisticsForMetadata: async function(nft_contract) {
        logger.infoLog(`FUNC - INDEXER - GetStatisticsForMetadata - HIT`)
        const response = await axios.get(
          `https://api.zildexr.com/contract/${nft_contract}/attributes${testnetString}`,
          { headers: { "X-API-KEY": client.indexApiKey } }
        ).catch((error) => {
          logger.errorLog(`Unable to get statistics for metadata for contract: ${nft_contract}: ${error}`)
          throw 'Unable to get statistics for metadata for contract'
        })
        return response
    },
}
