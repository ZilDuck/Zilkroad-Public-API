const fungibleToken = require('../models/fungible-tokens')
const cache = require('../cache/cache.js')
const { fromBech32Address, validation } = require('@zilliqa-js/zilliqa')

const cacheTime = 30

module.exports = {
    GetFungibleForAddress: async function(req, res) {
        var walletAddress = req.params.walletAddress.toLowerCase()

        if (validation.isBech32(walletAddress)) {
          walletAddress = fromBech32Address(walletAddress)
        }
        console.log("Getting fungible data for address: ", walletAddress)

        const cacheResult = await cache.GetKey(`getFungibleAmounts-${walletAddress}`)
        if (cacheResult === false) 
        {
          console.log("No cache result for this address")
          const fetchData = await fungibleToken.GetFungibleDataForAddress(walletAddress)
          await cache.SetKey(`getFungibleAmounts-${walletAddress}`, fetchData, cacheTime)
          res.send(fetchData)
        }
        else
        {
          console.log("Using cache result of: %j", cacheResult)
          res.send(cacheResult)
        }
    }
}