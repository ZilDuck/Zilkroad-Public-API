const redis = require('redis');
require('dotenv').config()
const logger = require('../logger.js')

const cache_enabled = process.env.ENABLE_CACHE === 'true' ? true : false
const cache_default_age = process.env.CACHE_AGE ?? 300
logger.infoLog(`cache active : ${cache_enabled} // cache age : ${cache_default_age}`)
logger.infoLog(`cache url : ${process.env.REDIS_URL} // cache port : ${process.env.REDIS_PORT}`)

let client = redis.createClient(
  {
      socket: {
          host: process.env.REDIS_URL,
          port: process.env.REDIS_PORT
      },
  }
)

module.exports =
  {
    SetKey: async function(key, value, expiry = cache_default_age)
    {
        if(cache_enabled)
        {
          value = JSON.stringify(value)
          validInputs = validateCacheInputs(key, value, expiry)
          if(validInputs)
          {
            const response = await client.set(key, value, {
                EX: expiry,
                NX: true
              });
            logger.debugLog(`response ${response}`)
          }
        }
        else
        {
          logger.debugLog(`cache disabled`)
        }
    },
    // A boolean false response indicates no value is in the cache
    GetKey: async function(key)
    {
      if(cache_enabled)
      {
          const value = await client.get(key)
          if(value !== null)
          {
            logger.debugLog(`returning cache value`)
            logger.debugLog(value)
            return JSON.parse(value)
          }
          else 
          {
            logger.debugLog(`no cache value found`)
            return false
          }
      }
      else
      {
        logger.debugLog(`cache disabled`)
        return false
      }
    }
  }

// A bit verbose, but readable
function validateCacheInputs(key, value, expiry)
{
    // validate key
    if (typeof key === 'string') {

    }
    else { // fail
      logger.infoLog(`ValidationTypeErroKey : ${key} is not a string`)
      return false
    }

    // validate value
    if (typeof value === 'string') {

    }
    else{ // fail
      logger.infoLog(`ValidationTypeErrorValue : ${value} is not a string`)
      return false
    }

    // validate expiry
    if (Number.isInteger(expiry)) {
      // at this point validate the params
      return true
    }
    else { // fail
      logger.infoLog(`ValidationTypeErrorExpiry : ${expiry} is not a integer`)
      return false
    }
}

client.connect().catch(console.error)