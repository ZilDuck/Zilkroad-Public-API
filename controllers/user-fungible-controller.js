const fungibleToken = require('../models/fungible-tokens')
const cache = require('../cache/cache.js')
const { toBech32Address, fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
module.exports = {
    GetFungibleForAddress: async function(req, res) {
        var walletAddress = req.params.walletAddress

        if (validation.isBech32(walletAddress)) {
          walletAddress = fromBech32Address(walletAddress)
        }

        const cacheResult = cache.GetKey(`getFungibleAmounts-${walletAddress}`)
        if (cacheResult === false) 
        {
          const fetchData = await fungibleToken.GetFungibleDataForAddress(walletAddress)
          cache.SetKey(`getFungibleAmounts-${walletAddress}`, fetchData)
          res.send(fetchData)
        }
        else
        {
          res.send(cacheResult)
        }
    }
}