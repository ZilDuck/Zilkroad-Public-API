const search = require('../models/search.js')
const cache = require('../cache/cache.js')

module.exports = {
  getSearchResults: async function(req, res) {
    const queryString = req.params.search

    const cacheResult = cache.GetKey(`getSearchResults-${queryString}`)
    if (cacheResult === false) 
    {
      let fetchData = await search.SearchString(queryString)
      if (fetchData.length < 1) {
        fetchData = search.getSearchFallback(queryString)
      }
      cache.SetKey(`getSearchResults-${queryString}`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}