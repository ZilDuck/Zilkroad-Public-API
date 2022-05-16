const calendar = require('../models/calendar')
const cache = require('../cache/cache.js')

module.exports = {
    GetCalendarForPeriod: async function(req, res) {
    const period = req.query.period ?? 'day'
    const offset = req.query.offset ?? '0'
    const limit = req.query.limit ?? '100'
    const timezone = req.query.timezone ?? 'Europe/London'

    const cacheResult = cache.GetKey(`GetCalendarForPeriod-${period}-${offset}-${limit}-${timezone}`)
    if (cacheResult === false) 
    {
      const fetchData = await calendar.GetCalendarForPeriod(period, limit, offset, timezone)
      cache.SetKey(`GetCalendarForPeriod-${period}-${offset}-${limit}-${timezone}`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  },
}