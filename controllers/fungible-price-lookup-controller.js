const fungibleLookup = require('../models/fungible-lookup')
const cache = require('../cache/cache.js')

module.exports = {
    lookupPrice: async function(req, res) {
    const fungible_symbol = req.params.fungible_symbol
    const fungible_amount = req.params.fungible_amount

    const cacheResult = cache.GetKey(`getCollection-${fungible_symbol}/${fungible_amount}`)
    if (cacheResult === false) {
      const fetchData = await fungibleLookup.LookupFungiblePriceData(fungible_symbol, fungible_amount).catch((error) => console.error(error))
      cache.SetKey(`lookupPrice-${fungible_symbol}/${fungible_amount}`, fetchData)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  }
}