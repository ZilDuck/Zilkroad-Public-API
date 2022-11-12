const contract = require('../models/contract')
const nft = require('../models/token')
const cache = require('../cache/cache.js')
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 30

module.exports = {
  getCollectionStats: async function(req, res) {
    const contractAddress = addressUtil.NormaliseAddressToBase16(req.params.contractAddress)

    const cacheResult = await cache.GetKey(`getCollection-${contractAddress}`)
    if (cacheResult === false) {
      const fetchData = await contract.GetContract(contractAddress).catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      await cache.SetKey(`getCollection-${contractAddress}`, fetchData, cacheTime)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  }
}