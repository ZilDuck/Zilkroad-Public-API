const dateUtils = require('../utils/dateUtils.js')
const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const axios = require("axios");



function Metadata(metadata_name, metadata_description, metadata_url, metadata_animation_url)
{
    return {
        name: metadata_name, 
        description: metadata_description, 
        url: metadata_url, 
        animation_url: metadata_animation_url
    }
}

module.exports = {
    Metadata
}
