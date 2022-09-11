const primarySales = require('../models/primary-sales.js')
const cache = require('../cache/cache.js')

const cacheTime = 3600

module.exports = {
  getPrimarySales: async function(req, res) {
    const limit = req.query.limit ?? 100
    const offset = req.query.offset ?? 0

    const cacheResult = await cache.GetKey(`getPrimarySales-${limit}-${offset}`)
    if (cacheResult === false) 
    {
      const fetchData = await primarySales.GetPrimarySales(limit, offset)
      await cache.SetKey(`getPrimarySales-${limit}-${offset}`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }

}