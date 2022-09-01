const advert = require('../models/advert')
const cache = require('../cache/cache.js')

const cacheTime = 900

module.exports = {
  getAdvert: async function(req, res) {
    const advertId = req.params.advertId

    const cacheResult = await cache.GetKey(`getAdvert-${advertId}`)
    if (cacheResult === false) 
    {
      const fetchData = await advert.getAdvert(advertId)
      await cache.SetKey(`getAdvert-${advertId}`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  },

  getAdverts: async function(req, res) {
    const page = req.params.page ?? 0
    const limit = req.query.limit ?? 10
    const filter = req.query.filter ?? ''
    const order = req.query.order ?? 'ASC'
    const orderBy = req.query.order ?? ''

    const cacheResult = await cache.GetKey(`getAdverts-${page}-${limit}-${filter}-${order}-${orderBy}`)
    if (cacheResult === false) 
    {
      const fetchData = advert.getAdverts(filter, limit, page, order, orderBy)
      await cache.SetKey(`getAdverts-${page}-${limit}-${filter}-${order}-${orderBy}`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}