require('dotenv').config()

const logger = require('../logger.js')
const { Zilliqa } = require('@zilliqa-js/zilliqa');

const zilliqa = new Zilliqa(process.env.current_network) // Same here 
const marketplace_contract = process.env.MARKETPLACE_CONTRACT;

module.exports =
{ 
    GetNativeZilBalanceForAddress : async function(address)
    {
      const zil_amount = await zilliqa.blockchain.getBalance(address).catch((error) => {
        logger.errorLog(`Unable to get balance for address: ${address}: ${error}`)
        throw 'Unable to get balance for address'
      })
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
      ]).catch((error) => {
        logger.errorLog(`Unable to get balances for supported tokens for contract: ${address}: ${error}`)
        throw 'Unable to get balance for supported tokens for collection'
      })
    
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
      ]).catch((error) => {
        logger.errorLog(`Unable to get allowances for supported tokens for contract: ${address}: ${error}`)
        throw 'Unable to get allowances for supported tokens for collection'
      })

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