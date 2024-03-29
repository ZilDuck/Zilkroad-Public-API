const advert = require('../models/advert')
const cache = require('../cache/cache.js')

const cacheTime = 900

module.exports = {
  getAdvert: async function(req, res) {
    const cacheResult = await cache.GetKey(`getAdvert`)
    if (cacheResult === false) 
    {
      const fetchData = await advert.GetAValidCardAdvertisements().catch((error) => {
        res.status(404).send({"message": error})
        return
      })
      await cache.SetKey(`getAdvert`, fetchData, cacheTime)
      res.send(fetchData)
    }
    else
    {
      res.send(cacheResult)
    }
  }
}
