const cache = require('../cache/cache.js')
const discordUtils = require('../utils/discordUtils.js')

const cacheTime = 3600

module.exports = {
    reportContract: async function(req, res) {
        const contract = req.params.contract
        const user = req.params?.user ?? '<no user>'

        const cacheResult = await cache.GetKey(`Report-${contract}-${user}`)
        if (cacheResult === false) 
        {
            await discordUtils.SendReportMessage(contract, user, cacheTime)
            await cache.SetKey(`Report-${contract}-${user}`, `${contract}-${user}`)
            res.status(200).send()
        }
        else
        {
            res.status(304).send() //cached
        }
    }

}