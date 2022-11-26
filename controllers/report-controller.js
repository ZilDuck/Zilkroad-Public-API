const cache = require('../cache/cache.js')
const discordUtils = require('../utils/discordUtils.js')
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 3600

module.exports = {
    reportContract: async function(req, res) {
        let contract
        try {
          contract = addressUtil.NormaliseAddressToBase16(req.params.contractAddress)
        } catch (error) {
            res.status(404).send({"message": error})
            return
        }
        const user = req.params?.user ?? '<no user>'

        const cacheResult = await cache.GetKey(`Report-${contract}-${user}`)
        if (cacheResult === false) 
        {
            await discordUtils.SendReportMessage(contract, user, cacheTime).catch((error) => {
                res.status(404).send({"message": error})
                return
            })
            await cache.SetKey(`Report-${contract}-${user}`, `${contract}-${user}`, cacheTime)
            res.status(200).send()
        }
        else
        {
            res.status(304).send() //cached
        }
    }

}