const cache = require('../cache/cache.js')

module.exports = 
{
    getCacheStats: async function(req, res) 
    {
        console.log(cache)
        res.send(cache.GetStatsForCache())
    },
    clearCache: async function(req, res) 
    {
        cache.FlushCache();
        res.send(cache.GetStatsForCache())
    }
}