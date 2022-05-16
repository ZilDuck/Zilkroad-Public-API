const contract = require('../models/contract')
const nft = require('../models/token')
const cache = require('../cache/cache.js')

module.exports = {
  getCollection: async function(req, res) {
    const contractAddress = req.params.contractAddress

    const cacheResult = cache.GetKey(`getCollection-${contractAddress}`)
    if (cacheResult === false) {
      const fetchData = await contract.GetContract(contractAddress).catch((error) => console.error(error))
      cache.SetKey(`getCollection-${contractAddress}`, fetchData)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  },

  getCollectionNfts: async function(req, res) {
    const contractAddress = req.params.contractAddress
    const page = req.query.page ?? 1
    const limit = req.query.limit ?? 10
    const filter = req.query.filter ?? ''
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = cache.GetKey(`getCollectionNfts-${contractAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const fetchData = await nft.getContractNfts(contractAddress, filter, limit, page, order, orderBy)
      cache.SetKey(`getCollectionNfts-${contractAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`, fetchData)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  },

  getCollections: async function(req, res) {
    const page = req.params.page ?? 0
    const limit = req.query.limit ?? 10
    const filter = req.query.filter ?? ''
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = cache.GetKey(`getCollections-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const fetchData = await contract.GetContractNfts(contractAddress, filter, limit, page, order, orderBy)
      cache.SetKey(`getCollections-${page}-${limit}-${filter}-${order}-${orderBy}`, fetchData)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  }
}