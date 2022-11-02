const { fromBech32Address } = require('@zilliqa-js/crypto')

module.exports = {
    NormaliseAddressToBase16: function(b32_address)
    {
        if(b32_address.toLowerCase().startsWith('zil1'))
        {
            return b16_address = fromBech32Address(b32_address)
        }
        else
        {
            console.log(`NormaliseAddressToBase16 - could not normalise ${b32_address} to b16, returning b32`)
            return b32_address.toLowerCase()
        } 
    }
}