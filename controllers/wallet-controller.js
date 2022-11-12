const wallet = require('../models/user')
const token = require('../models/token')
const cache = require('../cache/cache.js')
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 30

module.exports = {
  getWallet: async function(req, res) {
    let walletAddress
    try {
      walletAddress = addressUtil.NormaliseAddressToBase16(req.params.walletAddress)
    } catch (error) {
      res.status(404).send({"message": error})
      return
    }

    const cacheResult = await cache.GetKey(`getWallet-${walletAddress}`)
    if (cacheResult === false) {
      let walletData = await wallet.GetUser(walletAddress).catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      const nfts = await token.getUserNfts(walletAddress).catch((error) => {
        res.status(404).send({"message": error})
      })

      walletData = { ...walletData, nfts }
      await cache.SetKey(`getWallet-${walletAddress}`, walletData, cacheTime)
      res.send(walletData)
    } else {
      res.send(cacheResult)
    }
  },

  getWalletNfts: async function(req, res) {
    let walletAddress
    try {
      walletAddress = addressUtil.NormaliseAddressToBase16(req.params.walletAddress)
    } catch (error) {
      res.status(404).send({"message": error})
      return
    }
    const page = req.query.page ?? 1
    const limit = req.query.limit ?? 10
    const filter = req.query.filter ?? ''
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = await cache.GetKey(`getWalletNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const nfts = await token.getUserNfts(walletAddress, limit, page).catch((error) => {
        res.status(404).send({"message": error})
        return
      })

      await cache.SetKey(`getWalletNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`, nfts, cacheTime)
      res.send(nfts)
    } else {
      res.send(cacheResult)
    }
  },

  getWalletListedNfts: async function(req, res) {
    let walletAddress
    try {
      walletAddress = addressUtil.NormaliseAddressToBase16(req.params.walletAddress)
    } catch (error) {
      res.status(404).send({"message": error})
      return
    }
    const page = req.query.page ?? 1
    const limit = req.query.limit ?? 10
    const filter = req.query.filter ?? ''
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = await cache.GetKey(`getWalletListedNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) {
      const listings = await wallet.GetPageUserListing(walletAddress, limit, (page - 1)).catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      const nfts = await token.getUserListedNfts(listings, walletAddress, limit, page).catch((error) => {
        res.status(404).send({"message": error})
        return
      })

      await cache.SetKey(`getWalletListedNfts-${walletAddress}-${page}-${limit}-${filter}-${order}-${orderBy}`, nfts, cacheTime)
      res.send(nfts)
    } else {
      res.send(cacheResult)
    }
  },

  getRankedWalletActivitiesByType: async function(req, res) {
    const filter = req.query.filter
    const cacheResult = await cache.GetKey(`getRankedWalletAcitvitiesBy=${filter}`)
    if (cacheResult === false) {
      const result = await wallet.DBGetRankedWalletActivity(filter).catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      res.send(result)
    } else {
      res.send(cacheResult)
    }
  }

}