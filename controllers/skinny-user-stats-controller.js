const skinnyUserStats = require('../models/skinny-user-stats.js')
const cache = require('../cache/cache.js')

const cacheTime = 30

module.exports = {
    getSkinnyUserStats: async function(req, res) {
    const startTime = req.query.startTime ?? 0
    const endTime = req.query.endTime ?? 100000000000
    const limit = req.query.limit ?? 20
    const offset = req.query.offset ?? 0

    const cacheResult = await cache.GetKey(`getSkinnyUserStats-${startTime}-${endTime}-${limit}-${offset}`)
    if (cacheResult === false) 
    {
      const fetchData = await skinnyUserStats.getSkinnyUserStats(limit, offset, startTime, endTime).catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      await cache.SetKey(`getSkinnyUserStats-${startTime}-${endTime}-${limit}-${offset}`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}