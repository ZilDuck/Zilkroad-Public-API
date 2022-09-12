const search = require('../models/search.js')
const cache = require('../cache/cache.js')

const cacheTime = 900

module.exports = {
  getSearchResults: async function(req, res) {
    const queryString = req.params.search

    const cacheResult = await cache.GetKey(`getSearchResults-${queryString}`)
    if (cacheResult == false) 
    {
      let fetchData = await search.SearchString(queryString)
      if (fetchData.length < 1) {
        fetchData = search.getSearchFallback(queryString)
      }
      await cache.SetKey(`getSearchResults-${queryString}`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}