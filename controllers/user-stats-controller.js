const userStats = require('../models/user-stats.js')
const cache = require('../cache/cache.js')

const cacheTime = 30

module.exports = {
    getUserStats: async function(req, res) {
    const searchType = req.query.searchType ?? "buyer"
    const startTime = req.query.startTime ?? 0
    const endTime = req.query.endTime ?? 100000000000
    const limit = req.query.limit ?? 20
    const offset = req.query.offset ?? 0

    const cacheResult = await cache.GetKey(`getUserStats-${searchType}-${startTime}-${endTime}-${limit}-${offset}`)
    if (cacheResult === false) 
    {
      const fetchData = await userStats.getUserStats(searchType, startTime, endTime, limit, offset).catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      await cache.SetKey(`getUserStats-${searchType}-${startTime}-${endTime}-${limit}-${offset}`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}