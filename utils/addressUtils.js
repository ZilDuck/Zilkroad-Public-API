const { fromBech32Address } = require('@zilliqa-js/crypto')
const logger = require('../logger')

module.exports = {
    NormaliseAddressToBase16: function(b32_address)
    {
        logger.infoLog(`Address: ${b32_address}`)
        try {
            if(b32_address.toLowerCase().startsWith('zil1'))
            {
                return b16_address = fromBech32Address(b32_address)
            }
            else if (b32_address.toLowerCase().startsWith('0x'))
            {
                logger.infoLog(`NormaliseAddressToBase16 - Address is already b16`)
                return b32_address.toLowerCase()
            } else {
                logger.errorLog(`Unable to identify address: ${b32_address}`)
                throw 'Unable to identify address'
            }
        } catch (error) {
            logger.errorLog(`Unable to convert address; ${b32_address}: ${error}`)
            throw 'Unable to convert address'
        }
    }
}