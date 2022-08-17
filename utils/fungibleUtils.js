require('dotenv').config()

const logger = require('../logger.js')
const { Zilliqa } = require('@zilliqa-js/zilliqa');

const zilliqa = new Zilliqa(process.env.current_network) // Same here 
process.env.is_testnet ? console.log("UTILS TESTNET") : console.log("UTILS MAINNET") 

module.exports =
{ 
    GetNativeZilBalanceForAddress : async function(address)
    {
      const zil_amount = await zilliqa.blockchain.getBalance(address)
      console.log(zil_amount.result.balance)
      return zil_amount.result.balance
    },
    GetFungibleAmountForAddress: async function(address)
    {
        const wzil_req = [
            process.env.WZIL_CONTRACT,
            'balances',
            [address],
          ];
          const gzil_req = [
            process.env.GZIL_CONTRACT,
            'balances',
            [address],
          ];
          const xsgd_req = [
            process.env.XSGD_CONTRACT,
            'balances',
            [address],
          ];
          const zwbtc_req = [
            process.env.ZWBTC_CONTRACT,
            'balances',
            [address],
          ];
          const zeth_req = [
            process.env.ZETH_CONTRACT,
            'balances',
            [address],
          ];
          const zusdt_req = [
            process.env.ZUSDT_CONTRACT,
            'balances',
            [address],
          ];
          const duck_req = [
            process.env.DUCK_CONTRACT,
            'balances',
            [address],
          ];

        
          const fungible_amount_state = await zilliqa.blockchain.getSmartContractSubStateBatch([
            wzil_req,
            gzil_req,
            xsgd_req,
            zwbtc_req,
            zeth_req,
            zusdt_req,
            duck_req
          ]);
        
          console.log(`returning ${JSON.stringify(fungible_amount_state.batch_result)}`)
          return fungible_amount_state.batch_result
    }
}