const logger = require('../logger.js')
const { Zilliqa } = require('@zilliqa-js/zilliqa');

const zilliqa = new Zilliqa(process.env.current_network) // Same here 
/*
 * HELPER EXPORTED CLASS 
 * ALL OF THE ONE OFF RPC CALLS REQUIRED
 */
module.exports =
{ 
    GetTokenIDCount: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetTokenIDCount - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'token_id_count',
        ).catch((error) => {
            logger.errorLog(`Unable to get contract substate for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get collection substate'
        })

        logger.debugLog(stateResult.result?.token_id_count);
        return stateResult.result?.token_id_count
    },
    GetTotalSupplyCount: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetTotalSupplyCount - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'total_supply',
        ).catch((error) => {
            logger.errorLog(`Unable to get supply count for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get supply count for collection'
        })
        logger.debugLog(stateResult.result?.total_supply);
        return stateResult.result?.total_supply
    },
    GetRoyaltyBPSForToken: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetRoyaltyBPSForToken - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'royalty_fee_bps',
        ).catch((error) => {
            logger.errorLog(`Unable to get Royalty BPS for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get Royalty BPS for collection'
        })
        logger.debugLog(stateResult.result?.royalty_fee_bps);
        return stateResult.result?.royalty_fee_bps
    },
    GetRoyaltyRecipientForToken: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetRoyaltyBPSForToken - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'royalty_recipient',
        ).catch((error) => {
            logger.errorLog(`Unable to get Royalty recipient for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get Royalty recipient for collection'
        })

        logger.debugLog(stateResult.result?.royalty_recipient);
        return stateResult.result?.royalty_recipient
    },
    GetTokenBalances: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetTokenBalances - HIT - ${nft_contract}`);
        const stateResult = await  zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'balances',
        ).catch((error) => {
            logger.errorLog(`Unable to get token balances for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get token balances for collection'
        })

        logger.debugLog(stateResult.result?.balances);
        return stateResult.result?.balances
    },
    GetTokenOperators: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenOperators - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'operators',
        ).catch((error) => {
            logger.errorLog(`Unable to get token operators for contract: ${contract}: ${error}`)
            throw 'Unable to get token operators for collection'
        })

        logger.debugLog(stateResult.result?.operators);
        return stateResult.result?.operators
    },
    GetTokenMinters: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenMinters - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'minters',
        ).catch((error) => {
            logger.errorLog(`Unable to get token minters for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get token minters for collection'
        })
        
        logger.debugLog(stateResult.result?.minters);
        return stateResult.result?.minters 
    },
    GetTokenBaseURI: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenBaseURI - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'base_uri',
        ).catch((error) => {
            logger.errorLog(`Unable to get token base uri for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get base uri for collection'
        })
       
        logger.debugLog(stateResult.result?.base_uri);
        return stateResult.result?.base_uri
    },
    GetTokenPauseStatus: async function(nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenPauseStatus - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'is_paused',
        ).catch((error) => {
            logger.errorLog(`Unable to get token pause status for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get token pause status for collection'
        })
       
        logger.debugLog(stateResult.result?.constructor);
        return stateResult.result?.constructor 
    },
    GetTokenContractOwner: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenContractOwner - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'contract_owner',
        ).catch((error) => {
            logger.errorLog(`Unable to get contract owner for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get owner for collection'
        })
        
        logger.debugLog(stateResult.result?.contract_owner);
        return stateResult.result?.contract_owner 
    },
    GetTokenContractOwnerRecipientHandover: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenContractOwnerRecipientHandover - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'contract_ownership_recipient',
        ).catch((error) => {
            logger.errorLog(`Unable to get handover recipient for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get handover recipient for collection'
        })
        
        logger.debugLog(stateResult.result?.contract_ownership_recipient);
        return stateResult.result?.contract_ownership_recipient 
    },
    GetTokenName: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenName - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'token_name',
        ).catch((error) => {
            logger.errorLog(`Unable to get token name for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get token name for collection'
        })
        
        logger.debugLog(stateResult.result?.token_name );
        return stateResult.result?.token_name ?? ""
    },
    GetTokenSymbol: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenSymbol - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'token_symbol',
        ).catch((error) => {
            logger.errorLog(`Unable to get token symbole for contract: ${nft_contract}: ${error}`)
            throw 'Unable to get token symbol for collection'
        })
        
        logger.debugLog(stateResult.result?.token_symbol);
        return stateResult.result?.token_symbol ?? ""

    },
}