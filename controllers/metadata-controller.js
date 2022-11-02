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
        let error_message = {
            msg: 'There was an error trying to get the metadata'
        }
        let contractAddress = String(req.params.contractAddress).toLowerCase()
        let base_uri = ''
        let response = {}

        try {
            if ( contractAddress === '' || contractAddress === undefined ) {
                throw 'No contract address found'
            }

            if ( contractAddress.startsWith('zil') ) {
                contractAddress = fromBech32Address(contractAddress)
            }

            base_uri = await GetTokenBaseURI(contractAddress)
            if ( base_uri === '' || base_uri === undefined ) {
                throw `Base uri for ${contractAddress} was empty`
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

                meta_data_response = await axios.get(base_uri)
                meta_data_response = meta_data_response.data ?? {}

                if ( meta_data_response === undefined ) {
                    throw `No metadata could be found for contract ${contractAddress}`
                    error_message.extra_information = `No metadata could be found for contract ${contractAddress}`
                    error_message.contract_address = contractAddress
                    error_message.base_uri = base_uri
                    res.status(404).send(res)
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

        } catch (e) {
            error_message.extra_information = e
            error_message.contract_address = contractAddress
            error_message.base_uri = base_uri
            res.status(404).send(error_message)
        }
    }
}
