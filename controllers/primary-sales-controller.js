const primarySales = require('../models/primary-sales.js')
const cache = require('../cache/cache.js')

module.exports = {
  getPrimarySales: async function(req, res) {
    const limit = req.query.limit ?? 100
    const offset = req.query.offset ?? 0

    const cacheResult = cache.GetKey(`getPrimarySales-${limit}-${offset}`)
    if (cacheResult === false) 
    {
      const fetchData = await primarySales.GetPrimarySales(limit, offset)
      cache.SetKey(`getPrimarySales-${limit}-${offset}`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }

}