const fungibleToken = require('../models/fungible-tokens')
const cache = require('../cache/cache.js')
const { fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 30

module.exports = {
    GetFungibleForAddress: async function(req, res) {
        var walletAddress = addressUtil.NormaliseAddressToBase16(req.params.walletAddress)

        if (validation.isBech32(walletAddress)) {
          walletAddress = fromBech32Address(walletAddress)
        }
        console.log("Getting fungible balance data for address: ", walletAddress)

        const cacheResult = await cache.GetKey(`getFungibleAmounts-${walletAddress}`)
        if (cacheResult === false) 
        {
          const fetchData = await fungibleToken.GetFungibleDataForAddress(walletAddress)
          await cache.SetKey(`getFungibleAmounts-${walletAddress}`, fetchData, cacheTime)
          res.send(fetchData)
        }
        else
        {
          res.send(cacheResult)
        }
    }
}