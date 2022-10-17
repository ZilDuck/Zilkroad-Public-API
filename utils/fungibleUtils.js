require('dotenv').config()

const logger = require('../logger.js')
const { Zilliqa } = require('@zilliqa-js/zilliqa');

const zilliqa = new Zilliqa(process.env.current_network) // Same here 
process.env.is_testnet ? console.log("UTILS TESTNET") : console.log("UTILS MAINNET") 
const marketplace_contract = process.env.marketplace_contract;

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
    },
    GetFungibleAllowancesForAddress: async function(address) {
      const poo = await zilliqa.blockchain.getSmartContractState(process.env.WZIL_CONTRACT)
      console.log("Raw contract data for WZIL: %j", poo)

      const wee = await zilliqa.blockchain.getSmartContractSubState(process.env.WZIL_CONTRACT, 'allowances', [address])
      console.log("Raw Substate for WZIL: %j", wee)

      console.log("Marketplace contract: ", marketplace_contract)

      const fungible_allowance_state = await zilliqa.blockchain.getSmartContractSubStateBatch([
        [
          process.env.WZIL_CONTRACT,
          'allowances',
          [address],
        ],
        [
          process.env.GZIL_CONTRACT,
          'allowances',
          [address],
        ],
        [
          process.env.XSGD_CONTRACT,
          'allowances',
          [address],
        ],
        [
          process.env.ZWBTC_CONTRACT,
          'allowances',
          [address],
        ],
        [
          process.env.ZETH_CONTRACT,
          'allowances',
          [address],
        ],
        [
          process.env.ZUSDT_CONTRACT,
          'allowances',
          [address],
        ],
        [
          process.env.DUCK_CONTRACT,
          'allowances',
          [address],
        ]
      ]);

      let batch_result = fungible_allowance_state.batch_result
      batch_result.forEach(function(item) {
        if ( item.result === null ) {
          let allowances = {}
          allowances[marketplace_contract] = "0"
          item.result = { "allowances": allowances }
        } else {
          let allowances = {}
          allowances[marketplace_contract] = item.result.allowances[address][marketplace_contract]
          item.result = { "allowances": allowances }
        }
      }, address, marketplace_contract)

      // This flattens it from [{"id": 1, "result": {"allowances": {"wallet-address": value}}}, {"id": "2"...}]
      // To {"1": value, "2": value, ...}
      let data = Object.assign({}, ...batch_result.map(
        (item) => ({[item.id]: item.result.allowances[marketplace_contract]})
        ))
      return data

    }
}