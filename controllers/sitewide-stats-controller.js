const sitewideStats = require('../models/sitewide-stats.js')
const cache = require('../cache/cache.js')

module.exports = {
    GetSitewideStats: async function(req, res) {

    const cacheResult = cache.GetKey(`GetSitewideStats`)
    if (cacheResult === false) 
    {
      const fetchData = await sitewideStats.GetSitewideStats()
      cache.SetKey(`GetSitewideStats`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}