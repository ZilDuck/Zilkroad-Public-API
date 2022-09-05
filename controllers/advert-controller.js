const advert = require('../models/advert')
const cache = require('../cache/cache.js')

module.exports = {
  getAdvert: async function(req, res) {

    const cacheResult = cache.GetKey(`getAdvert`)
    if (cacheResult === false) 
    {
      const fetchData = await advert.GetAValidCardAdvertisements()
      cache.SetKey(`getAdvert-${advertId}`, fetchData)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}
