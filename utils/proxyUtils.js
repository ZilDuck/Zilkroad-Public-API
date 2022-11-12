const logger = require('../logger.js')
const { Zilliqa } = require('@zilliqa-js/zilliqa');

const zilliqa = process.env.is_testnet ? new Zilliqa(process.env.testnet_zilliqa) : new Zilliqa(process.env.mainnet_zilliqa);
process.env.is_testnet ? console.log("UTILS TESTNET") : console.log("UTILS MAINNET") 

/*
 * HELPER EXPORTED CLASS 
 * ALL OF THE ONE OFF RPC CALLS REQUIRED
 */
module.exports =
{ 
    GetCurrentPrimaryProxyMintCount: async function (proxy_contract) {
        logger.infoLog(`ProxyUtils - GetCurrentMintCount - HIT - proxy:${proxy_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            proxy_contract,
            'current_mint_count',
        ).catch((error) => {
            logger.errorLog(`Unable to get current mint count for contract: ${proxy_contract}: ${error}`)
            throw 'Unable to get current mint count for collection'
        })
        return stateResult.result?.current_mint_count
    },
    GetTotalPrimaryProxyProfit: async function (proxy_contract) {
        logger.infoLog(`ProxyUtils - GetRoyaltyBPSForToken - HIT - proxy:${proxy_contract}`);
        const stateResult = await zilliqa.blockchain.getSmartContractSubState(
            proxy_contract,
            'lifetime_earnings',
        ).catch((error) => {
            logger.errorLog(`Unable to get liftime earnings for contract: ${proxy_contract}: ${error}`)
            throw 'Unable to get lifetime earnings for collection'
        })
        return stateResult.result?.lifetime_earnings
    },
}