const logger = require('../logger.js')
const { Zilliqa } = require('@zilliqa-js/zilliqa');

const zilliqa = new Zilliqa(process.env.current_network) // Same here 
process.env.is_testnet ? console.log("UTILS TESTNET") : console.log("UTILS MAINNET") 
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
        );

        logger.debugLog(stateResult.result.token_id_count);
        return stateResult.result.token_id_count
    },
    GetTotalSupplyCount: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetTotalSupplyCount - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'total_supply',
        );
        logger.debugLog(stateResult.result.total_supply);
        return stateResult.result.total_supply
    },
    GetRoyaltyBPSForToken: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetRoyaltyBPSForToken - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'royalty_fee_bps',
        );
        logger.debugLog(stateResult.result.royalty_fee_bps);
        return stateResult.result.royalty_fee_bps
    },
    GetRoyaltyRecipientForToken: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetRoyaltyBPSForToken - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'royalty_recipient',
        );

        logger.debugLog(stateResult.result.royalty_recipient);
        return stateResult.result.royalty_recipient
    },
    GetTokenBalances: async function (nft_contract) {
        logger.infoLog(`MODEL- NFTModel - GetTokenBalances - HIT - ${nft_contract}`);
        const stateResult = await  zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'balances',
        );

        logger.debugLog(stateResult.result.balances);
        return stateResult.result.balances
    },
    GetTokenOperators: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenOperators - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'operators',
        );

        logger.debugLog(stateResult.result.operators);
        return stateResult.result.operators
    },
    GetTokenMinters: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenMinters - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'minters',
        );
        
        logger.debugLog(stateResult.result.minters);
        return stateResult.result.minters 
    },
    GetTokenBaseURI: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenBaseURI - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'base_uri',
        );
       
        logger.debugLog(stateResult.result.base_uri);
        return stateResult.result.base_uri
    },
    GetTokenPauseStatus: async function(nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenPauseStatus - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'is_paused',
        );
       
        logger.debugLog(stateResult.result.constructor);
        return stateResult.result.constructor 
    },
    GetTokenContractOwner: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenContractOwner - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'contract_owner',
        );
        
        logger.debugLog(stateResult.result.contract_owner);
        return stateResult.result.contract_owner 
    },
    GetTokenContractOwnerRecipientHandover: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenContractOwnerRecipientHandover - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'contract_ownership_recipient',
        );
        
        logger.debugLog(stateResult.result.contract_ownership_recipient);
        return stateResult.result.contract_ownership_recipient 
    },
    GetTokenName: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenName - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'token_name',
        );
        
        logger.debugLog(stateResult.result?.token_name );
        return stateResult.result?.token_name ?? ""
    },
    GetTokenSymbol: async function (nft_contract) {
        logger.infoLog(`MODEL- UTILS - GetTokenSymbol - HIT - ${nft_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            nft_contract,
            'token_symbol',
        );
        
        logger.debugLog(stateResult.result?.token_symbol);
        return stateResult.result?.token_symbol ?? ""
    },
}