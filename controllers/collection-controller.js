const contract = require('../models/contract')
const nft = require('../models/token')
const cache = require('../cache/cache.js')
const { toBech32Address, fromBech32Address, validation } = require('@zilliqa-js/zilliqa')

const cacheTime = 30

module.exports = {
  getCollection: async function(req, res) {
    const contractAddress = req.params.contractAddress

    const cacheResult = await cache.GetKey(`getCollection-${contractAddress}`)
    if (cacheResult === false) {
      const fetchData = await contract.GetContract(contractAddress).catch((error) => console.error(error))
      await cache.SetKey(`getCollection-${contractAddress}`, fetchData, cacheTime)
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

    const cacheResult = await cache.GetKey(`getCollectionNfts-${contractAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const fetchData = await nft.getContractNfts(contractAddress, filter, limit, page, order, orderBy)
      await cache.SetKey(`getCollectionNfts-${contractAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`, fetchData, cacheTime)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  },

  getCollectionListedNfts: async function(req, res) {
    const contractAddress = req.params.contractAddress
    const limit = req.query.limit ?? 10
    const page = req.query.page ?? 1
    
    const cacheResult = await cache.GetKey(`getCollectionListedNfts-${contractAddress}-${page}-${limit}`)
    if ( cacheResult === false ) {
      const fetchData = await nft.getContractListedNfts(contractAddress, limit, (page - 1))
      await cache.SetKey(`getCollectionListedNfts-${contractAddress}-${page}-${limit}`, fetchData, cacheTime)
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

    const cacheResult = await cache.GetKey(`getCollections-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const fetchData = await contract.GetContractNfts(contractAddress, filter, limit, page, order, orderBy)
      await cache.SetKey(`getCollections-${page}-${limit}-${filter}-${order}-${orderBy}`, fetchData, cacheTime)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  },
  getCollectionActivity: async function(req, res)
  {
    const contractAddress = req.params.contractAddress
    const page = req.query.page ?? 1
    const limit = req.query.limit ?? 10

    if (validation.isBech32(contract_address)) {
      contract_address = fromBech32Address(contract_address)
    }

    const cacheResult = await cache.GetKey(`getCollectionActivity-${contractAddress}-${page}-${limit}`)
    if (cacheResult === false) {
      const fetchData = await contract.DBGetPaginatedContractActivity(contractAddress, (page - 1), limit)
      await cache.SetKey(`getCollectionActivity-${contractAddress}-${page}-${limit}`, fetchData, cacheTime)
      res.send(fetchData)
    } else {
      res.send(cacheResult)
    }
  }
}