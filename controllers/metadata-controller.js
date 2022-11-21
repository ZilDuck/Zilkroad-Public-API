const { fromBech32Address } = require('@zilliqa-js/zilliqa')
const logger = require("../logger");
const { Metadata } = require("../models/metadata");
const { GetTokenBaseURI } = require("../utils/nftUtils");
const axios = require("axios");
const cache = require('../cache/cache.js')
const ipfs_prefix = 'https://ipfs.io/ipfs/'
const metadataFileExtenstion = `metadata.json`
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 900

module.exports = {

    getMetadataForCollection: async function(req, res) 
    {
        let contractAddress
        try {
            contractAddress = addressUtil.NormaliseAddressToBase16(req.params.contractAddress)
        } catch(error) {
            res.status(404).send({"message": error})
            return
        }
        let base_uri = ''
        let response = {}

        if ( contractAddress === '' || contractAddress === undefined ) {
            res.status(404).send({"message": "No collection address found"})
            return
        }

        base_uri = await GetTokenBaseURI(contractAddress)
        if ( base_uri === '' || base_uri === undefined ) {
            res.status(404).send({"message": "No base uri found for collection"})
            return
        }

        const cache_result = await cache.GetKey(`Metadata-${contractAddress}`)

        if ( cache_result === false ) {
            if ( base_uri.startsWith('ipfs://') ) {
                if ( base_uri.includes('/ipfs/') ) {
                    base_uri = base_uri.split('/ipfs/').pop()
                    base_uri = ipfs_prefix + base_uri
                } else {
                    base_uri = base_uri.replace('ipfs://', ipfs_prefix)
                }
            } else if ( base_uri.startsWith('ar://') ) {
                base_uri = base_uri.replace('ar://', 'https://xqozxxt2juqo5ubrsd3gzsrznsj7ev5qhghtctqfkg2thfay.arweave.net/')
            }
            // Ensure the base_uri ends with a '/'
            base_uri = base_uri.endsWith('/') ? base_uri : base_uri + '/'
            base_uri = base_uri + metadataFileExtenstion

            meta_data_response = await axios.get(base_uri).catch((error) => {
                logger.errorLog(`Unable to get data from base uri: ${base_uri} for collection: ${collection}: ${error}`)
                res.status(404).send({"message": "Unable to get data from base uri for collection"})
                return
            })
            meta_data_response = meta_data_response.data ?? {}

            if ( meta_data_response === undefined ) {
                res.status(404).send({"message": "No metadata could be found for collection"})
                return
            }

            response = {
                name: meta_data_response.name ?? 'No Name',
                description: meta_data_response.description ?? '',
                external_url: meta_data_response.external_url ?? '',
                animation_url: meta_data_response.animation_url ?? '',
                collection_image_url: meta_data_response.collection_image_url ?? '',
                discord: meta_data_response.discord ?? '',
                twitter: meta_data_response.twitter ?? '',
                telegram: meta_data_response.telegram ?? ''
            }

            await cache.SetKey(`Metadata-${contractAddress}`, response, cacheTime)
            res.send(response)
        } else {
            res.send(cache_result)
        }
    }
}
