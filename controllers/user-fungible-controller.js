const fungibleToken = require('../models/fungible-tokens')
const cache = require('../cache/cache.js')
const { fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 30

module.exports = {
    GetFungibleForAddress: async function(req, res) {
      var walletAddress
      try {
        walletAddress = addressUtil.NormaliseAddressToBase16(req.params.walletAddress)
      } catch (error) {
        res.status(404).send({"message": error})
        return
      }

      if (validation.isBech32(walletAddress)) {
        walletAddress = fromBech32Address(walletAddress)
      }

      const cacheResult = await cache.GetKey(`getFungibleAmounts-${walletAddress}`)
      if (cacheResult === false) 
      {
        const fetchData = await fungibleToken.GetFungibleDataForAddress(walletAddress).catch((error) => {
          res.status(404).send({"message": error})
          return
        })
        await cache.SetKey(`getFungibleAmounts-${walletAddress}`, fetchData, cacheTime)
        res.send(fetchData)
      }
      else
      {
        res.send(cacheResult)
      }
    }
}