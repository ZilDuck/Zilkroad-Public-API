const sitewideStats = require('../models/sitewide-stats.js')
const cache = require('../cache/cache.js')

const cacheTime = 30

module.exports = {
    GetSitewideStats: async function(req, res) {

    const cacheResult = await cache.GetKey(`GetSitewideStats`)
    if (cacheResult === false) 
    {
      const fetchData = await sitewideStats.GetSitewideStats().catch((error) => {
        res.status(404).send({"message": error})
      })
      await cache.SetKey(`GetSitewideStats`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}