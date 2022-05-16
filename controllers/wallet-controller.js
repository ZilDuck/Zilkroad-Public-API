const wallet = require('../models/user')
const token = require('../models/token')
const cache = require('../cache/cache.js')

module.exports = {
  getWallet: async function(req, res) {
    const walletAddress = req.params.walletAddress

    const cacheResult = cache.GetKey(`getWallet-${walletAddress}`)
    if (cacheResult === false) {
      let walletData = await wallet.GetUser(walletAddress)
      const nfts = await token.getUserNfts(walletAddress)
      walletData = { ...walletData, nfts }
      cache.SetKey(`getWallet-${walletAddress}`, walletData)
      res.send(walletData)
    } else {
      res.send(cacheResult)
    }
  },

  getWalletNfts: async function(req, res) {
    const walletAddress = req.params.walletAddress
    const page = req.query.page ?? 1
    const limit = req.query.limit ?? 10
    const filter = req.query.filter ?? ''
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = cache.GetKey(`getWalletNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const nfts = await token.getUserNfts(walletAddress, limit, page)
      cache.SetKey(`getWalletNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`, nfts)
      res.send(nfts)
    } else {
      res.send(cacheResult)
    }
  },

  getWalletListedNfts: async function(req, res) {
    const walletAddress = req.params.walletAddress
    const page = req.query.page ?? 1
    const limit = req.query.limit ?? 10
    const filter = req.query.filter ?? ''
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = cache.GetKey(`getWalletListedNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const listings = await wallet.GetPageUserListing(walletAddress, limit, (page - 1))
      const nfts = await token.getUserListedNfts(listings, walletAddress, limit, page)
      cache.SetKey(`getWalletListedNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`, nfts)
      res.send(nfts)
    } else {
      res.send(cacheResult)
    }
  }

}