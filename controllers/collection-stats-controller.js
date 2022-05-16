const contract = require('../models/contract')
const nft = require('../models/token')
const cache = require('../cache/cache.js')

module.exports = {
  getCollectionStats: async function(req, res) {
    const contractAddress = req.params.contractAddress

    const cacheResult = cache.GetKey(`getCollection-${contractAddress}`)
    if (cacheResult === false) {
      const fetchData = await contract.GetContract(contractAddress).catch((error) => console.error(error))
      cache.SetKey(`getCollection-${contractAddress}`, fetchData)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  }
}