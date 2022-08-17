const dateUtils = require('../utils/dateUtils.js')
const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const axios = require("axios");



function Metadata(metadata_name, metadata_description, metadata_url, metadata_animation_url, 
                  collection_image_url, discord, twitter, telegram)
{
    return {
        name: metadata_name, 
        description: metadata_description, 
        url: metadata_url, 
        animation_url: metadata_animation_url,
        collection_image_url: collection_image_url,
        discord: discord,
        twitter: twitter,
        telegram: telegram
    }
}

module.exports = {
    Metadata
}
