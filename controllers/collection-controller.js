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
  },


  getAllCollectionRanks: async function(req, res)
  {
    const page = req.params.page ?? 0
    const limit = req.query.limit ?? 20
    const timeFrom = req.params.timeFrom ?? 0
    const timeTo = req.query.timeTo ?? 99999999999999

    const cacheResult = cache.GetKey(`getAllCollectionRanks-${page}-${limit}-${timeFrom}-${timeTo}`)
    if (cacheResult === false) {
      const fetchData = await contract.getAllCollectionRanks(page, limit, timeFrom, timeTo)
      cache.SetKey(`getAllCollectionRanks-${page}-${limit}-${timeFrom}-${timeTo}`, fetchData)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  },


  getACollectionRank: async function(req, res)
  {
    const contractAddress = req.params.contractAddress
    const timeFrom = req.params.timeFrom ?? 0
    const timeTo = req.query.timeTo ?? 99999999999999

    const cacheResult = cache.GetKey(`getACollectionRank-${contractAddress}-${timeFrom}-${timeTo}`)
    if (cacheResult === false) {
      const fetchData = await contract.getACollectionRank(contractAddress, timeFrom, timeTo)
      cache.SetKey(`getACollectionRank-${contractAddress}-${timeFrom}-${timeTo}`, fetchData)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  },
}