const userStats = require('../models/user-stats.js')
const cache = require('../cache/cache.js')

module.exports = {
    getUserStats: async function(req, res) {
    const searchType = req.query.searchType ?? "buyer"
    const startTime = req.query.startTime ?? 0
    const endTime = req.query.endTime ?? 100000000000
    const limit = req.query.limit ?? 20
    const offset = req.query.offset ?? 0

    const cacheResult = cache.GetKey(`getUserStats-${searchType}-${startTime}-${endTime}-${limit}-${offset}`)
    if (cacheResult === false) 
    {
      const fetchData = await userStats.getUserStats(searchType, startTime, endTime, limit, offset)
      cache.SetKey(`getUserStats-${searchType}-${startTime}-${endTime}-${limit}-${offset}`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}