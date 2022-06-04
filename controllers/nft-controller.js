const token = require('../models/token')
const listing = require('../models/listing')
const cache = require('../cache/cache.js')

module.exports = {
  getNft: async function(req, res) {
    const contractAddress = req.params.contractAddress
    const tokenId = req.params.tokenId

    const cacheResult = cache.GetKey(`getNft-${contractAddress}-${tokenId}`)
    if (cacheResult === false) {
      let nftData = await token.getToken(tokenId, contractAddress)
      let listingData = await listing.GetNftListing(contractAddress, tokenId)
      nftData = { ...nftData, ...listingData }
      cache.SetKey(`getNft-${contractAddress}-${tokenId}`, nftData)
      res.send(nftData)
    } else {
      res.send(cacheResult)
    }
  },

  getNfts: async function(req, res) {
    const page = req.params.page ?? 0
    const filter = req.query.filter ?? ''
    const limit = req.query.limit ?? 10
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = cache.GetKey(`getNfts-${page}-${filter}-${limit}-${order}-${orderBy}`)
    if (cacheResult === false) 
    {
      const fetchData = await token.getTokens(filter, limit, page, order, orderBy)
      cache.SetKey(`getNfts-${page}-${filter}-${limit}-${order}-${orderBy}`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  },
  
  getNftSpender: async function(req, res) {
    const contractAddress = req.params.contractAddress
    const tokenId = req.params.tokenId

    const cacheResult = cache.GetKey(`getNftSpender-${contractAddress}-${tokenId}`)
    if (cacheResult === false) {
      let nftSpender = await token.GetTokenSpender(tokenId, contractAddress)
      cache.SetKey(`getNftSpender-${contractAddress}-${tokenId}`, nftSpender)
      res.send(nftSpender)
    } else {
      res.send(cacheResult)
    }
  },

  getFungibleAllowance: async function(req, res) {
    const contractAddress = req.params.contractAddress
    const userAddress = req.params.userAddress

    const cacheResult = cache.GetKey(`getFungibleAllowance-${contractAddress}-${userAddress}`)
    if (cacheResult === false) {
      let ftAllowance = await token.GetTokenAllowance(contractAddress, userAddress)
      cache.SetKey(`getFungibleAllowance-${contractAddress}-${userAddress}`, ftAllowance)
      res.send(ftAllowance)
    } else {
      res.send(cacheResult)
    }
  }

}