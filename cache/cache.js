const NodeCache = require('node-cache')
const cache = new NodeCache()
const cache_expiry_time_seconds = 300
const logger = require('../logger.js')
const cache_disabled = process.env.DISABLE_CACHE === 'true' ? true : false

logger.infoLog(`cache == ${cache_disabled}`)
// cache will expire items after 300s
module.exports =
  {

    // if calls have no key passed, then use the method name
    // if calls have keys passed then use both (call,key) as the key
    SetKey: function(key, data_obj) {
      if (cache_disabled) {
        logger.infoLog(`Cache - SetKey - Disabled!`)
        return false
      }

      logger.infoLog(`Cache - SetKey - ${key}`)
      cache.set(key, data_obj, cache_expiry_time_seconds)
    },

    // returns cache key if it has it
    // else returns false
    GetKey: function(key) {
      if (cache_disabled) {
        logger.infoLog(`Cache - GetKey - Disabled!`)
        return false
      }

      value = cache.get(key)
      if (value == undefined) {
        // handle miss!
        logger.infoLog(`Cache - GetKey - Miss!`)
        return false
      } else {
        logger.infoLog(`Cache - GetKey - Hit!`)
        return value
      }
    },

    GetStatsForCache: function()
    {
      return cache.getStats();
    },

    FlushCache: function()
    {
      cache.flushAll();
      return cache.getStats();
    }
  }