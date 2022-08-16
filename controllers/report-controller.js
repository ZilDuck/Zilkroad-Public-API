const cache = require('../cache/cache.js')
const discordUtils = require('../utils/discordUtils.js')
module.exports = {
    reportContract: async function(req, res) {
        const contract = req.params.contract
        const user = req.params?.user ?? 'non logged in user'

        const cacheResult = cache.GetKey(`Report-${contract}-${user}`)
        if (cacheResult === false) 
        {
            await discordUtils.SendReportMessage(contract, user)
            cache.SetKey(`Report-${contract}-${user}`, `${contract}-${user}`)
            res.status(200).send()
        }
        else
        {
            res.status(304).send() //cached
        }
    }

}