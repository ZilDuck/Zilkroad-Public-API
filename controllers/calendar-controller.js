const calendar = require('../models/calendar')
const cache = require('../cache/cache.js')

const cacheTime = 3600

module.exports = {
    GetCalendarForPeriod: async function(req, res) {
    const period = req.query.period ?? 'day'
    const offset = req.query.offset ?? '0'
    const limit = req.query.limit ?? '100'
    const timezone = req.query.timezone ?? 'Europe/London'

    const cacheResult = await cache.GetKey(`GetCalendarForPeriod-${period}-${offset}-${limit}-${timezone}`)
    if (cacheResult === false) 
    {
      const fetchData = await calendar.GetCalendarForPeriod(period, limit, offset, timezone)
      await cache.SetKey(`GetCalendarForPeriod-${period}-${offset}-${limit}-${timezone}`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  },
}