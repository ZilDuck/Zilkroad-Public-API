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
  },

  getWalletBalances: async function(req, res) {
    const walletAddress = req.params.walletAddress
    const wzilContract = '0x864895d52504c388A345eF6cd9C800DBBD0eF92A' // TODO: store in db or in config
    const gzilContract = '0xa845C1034CD077bD8D32be0447239c7E4be6cb21' // TODO: store in db or in config
    const zwethContract = '0x2cA315F4329654614d1E8321f9C252921192c5f2' // TODO: store in db or in config
    const zbtcContract = '0x75fA7D8BA6BEd4a68774c758A5e43Cfb6633D9d6' // TODO: store in db or in config
    const zwusdtContract = '0x818Ca2e217E060aD17B7bD0124a483a1f66930a9' // TODO: store in db or in config
    const xsgdContract = '0x3Bd9aD6FEe7BfdF5B5875828B555E4f702e427Cd' // TODO: store in db or in config

    let wzil = await token.GetTokenBalance(wzilContract, walletAddress)
    let gzil = await token.GetTokenBalance(gzilContract, walletAddress)
    let zweth = await token.GetTokenBalance(zwethContract, walletAddress)
    let zbtc = await token.GetTokenBalance(zbtcContract, walletAddress)
    let zwusdt = await token.GetTokenBalance(zwusdtContract, walletAddress)
    let xsgd = await token.GetTokenBalance(xsgdContract, walletAddress)

    let balances = {
      wzil,
      gzil,
      zweth,
      zbtc,
      zwusdt,
      xsgd
    }

    res.send(balances)
  }

}