const { fromBech32Address } = require('@zilliqa-js/crypto')
const logger = require('../logger')

module.exports = {
    NormaliseAddressToBase16: function(b32_address)
    {
        try {
            if(b32_address.toLowerCase().startsWith('zil1'))
            {
                return b16_address = fromBech32Address(b32_address)
            }
            else
            {
                logger.warnLog(`NormaliseAddressToBase16 - could not normalise ${b32_address} to b16, returning b32`)
                return b32_address.toLowerCase()
            } 
        } catch (error) {
            logger.errorLog(`Unable to convert address; ${b32_address}: ${error}`)
            throw 'Unable to convert address'
        }
    }
}