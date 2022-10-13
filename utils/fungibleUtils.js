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
      return zil_amount.result?.balance ?? 0
    },
    GetFungibleAmountForAddress: async function(address)
    {      
      const fungible_amount_state = await zilliqa.blockchain.getSmartContractSubStateBatch([
        [
          process.env.WZIL_CONTRACT,
          'balances',
          [address],
        ],
        [
          process.env.GZIL_CONTRACT,
          'balances',
          [address],
        ],
        [
          process.env.XSGD_CONTRACT,
          'balances',
          [address],
        ],
        [
          process.env.ZWBTC_CONTRACT,
          'balances',
          [address],
        ],
        [
          process.env.ZETH_CONTRACT,
          'balances',
          [address],
        ],
        [
          process.env.ZUSDT_CONTRACT,
          'balances',
          [address],
        ],
        [
          process.env.DUCK_CONTRACT,
          'balances',
          [address],
        ]
      ]);
    
      let batch_result = fungible_amount_state.batch_result
      batch_result.forEach(function(item) {
        if ( item.result === null ) {
          let balances = {}
          balances[address] = "0"
          item.result = { "balances": balances }
        }
      }, address)

      // This flattens it from [{"id": 1, "result": {"balances": {"wallet-address": value}}}, {"id": "2"...}]
      // To {"1": value, "2": value, ...}
      let data = Object.assign({}, ...batch_result.map(
        (item) => ({[item.id]: item.result.balances[address]})
        ))
      return data
    }
}