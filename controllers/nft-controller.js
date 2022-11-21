const token = require('../models/token')
const listing = require('../models/listing')
const cache = require('../cache/cache.js')
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 30

module.exports = {
  getNft: async function(req, res) {
    let contractAddress
    try {
      contractAddress = addressUtil.NormaliseAddressToBase16(req.params.contractAddress)
    } catch (error) {
      res.status(404).send({"message": error})
      return
    }
    const tokenId = req.params.tokenId
    let failed = false

    const cacheResult = await cache.GetKey(`getNft-${contractAddress}-${tokenId}`)
    if (cacheResult === false) {
      let nftData = await token.getToken(tokenId, contractAddress).catch((error) => {
        res.status(404).send({"message": error})
        failed = true
      })
      let listingData = await listing.GetNftListing(contractAddress, tokenId).catch((error) => {
        res.status(404).send({"message": error})
        failed = true
      })

      // Love asynchronous race conditions
      if ( failed ) {
        return
      }
      nftData = { ...nftData, ...listingData }
      await cache.SetKey(`getNft-${contractAddress}-${tokenId}`, nftData, cacheTime)
      res.send(nftData)
    } else {
      res.send(cacheResult)
    }
    
  },

  getNfts: async function(req, res) {
    const page = req.params.page ?? 0
    const filter = req.query.filter ?? ''
    const limit = req.query.limit ?? 12
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = await cache.GetKey(`getNfts-${page}-${filter}-${limit}-${order}-${orderBy}`)
    if (cacheResult === false) 
    {
      const nftData = await token.getTokens(filter, limit, page, order, orderBy).catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      await cache.SetKey(`getNfts-${page}-${filter}-${limit}-${order}-${orderBy}`, nftData, cacheTime)
      res.send(nftData)
    }
    else
    {
      res.send(cacheResult)
    }
  },
  
  getNftSpender: async function(req, res) {
    let contractAddress
    try {
      contractAddress = addressUtil.NormaliseAddressToBase16(req.params.contractAddress)
    } catch (error) {
      res.status(404).send({"message": error})
      return
    }
    const tokenId = req.params.tokenId

    const cacheResult = await cache.GetKey(`getNftSpender-${contractAddress}-${tokenId}`)
    if (cacheResult === false) {
      let nftSpender = await token.GetTokenSpender(tokenId, contractAddress).catch((error) => {
        res.status(404).send({"message": error})
      })
      await cache.SetKey(`getNftSpender-${contractAddress}-${tokenId}`, nftSpender, cacheTime)
      res.send(nftSpender)
    } else {
      res.send(cacheResult)
    }
  },

  getFungibleAllowance: async function(req, res) {
    let contractAddress
    try {
      contractAddress = addressUtil.NormaliseAddressToBase16(req.params.contractAddress)
    } catch (error) {
      res.status(404).send({"message": error})
      return
    }
    const userAddress = req.params.userAddress

    const cacheResult = await cache.GetKey(`getFungibleAllowance-${contractAddress}-${userAddress}`)
    if (cacheResult === false) {
      let ftAllowance = await token.GetTokenAllowance(contractAddress, userAddress).catch((error) => {
        res.status(404).send({"message": error})
      })
      await cache.SetKey(`getFungibleAllowance-${contractAddress}-${userAddress}`, ftAllowance, cacheTime)
      res.send(ftAllowance)
    } else {
      res.send(cacheResult)
    }
  }

}