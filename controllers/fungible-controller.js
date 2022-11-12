const fungible = require('../models/fungible')
const cache = require('../cache/cache.js')

const cacheTime = 900

module.exports = {
  getAllTokens: async function(req, res) {
    const cacheResult = await cache.GetKey(`FungibleTokens`)
    if (cacheResult === false) {
      const fetchData = await fungible.GetAllFungibleTokens().catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      await cache.SetKey(`FungibleTokens`, fetchData, cacheTime)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  }
}