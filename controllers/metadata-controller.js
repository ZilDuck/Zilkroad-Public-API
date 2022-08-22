const { fromBech32Address } = require('@zilliqa-js/zilliqa')
const logger = require("../logger");
const { Metadata } = require("../models/metadata");
const { GetTokenBaseURI } = require("../utils/nftUtils");
const axios = require("axios");
const cache = require('../cache/cache.js')

const metadataFileExtenstion = `metadata.json`

module.exports = {

    getMetadataForCollection: async function(req, res) 
    {
        try
        {
            let contractAddress = String(req.params.contractAddress).toLowerCase()

            if(contractAddress.startsWith(`zil`))
            {
                contractAddress = fromBech32Address(contractAddress)
            }

            logger.infoLog(`got contractAddress ${contractAddress}`)

            let baseURI = await GetTokenBaseURI(contractAddress)

            logger.infoLog(`got baseURI ${baseURI}`)
            
            if(baseURI === undefined || baseURI == "")
            {
                logger.errorLog(`fucked it ${baseURI}`)
                res.status(404).send(`No base_uri set`)
            }
            else
            {
                if(baseURI.startsWith(`ipfs://`))
                {
                    baseURI = baseURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
                }
                if(baseURI.startsWith(`ar://`))
                {
                    baseURI = baseURI.replace('ar://', 'https://xqozxxt2juqo5ubrsd3gzsrznsj7ev5qhghtctqfkg2thfay.arweave.net/')
                }

                logger.infoLog(`Attempting to find metadata at ${baseURI + metadataFileExtenstion}`)

                const cacheResult = cache.GetKey(`Metadata-${contractAddress}`, contractAddress)
                var metadataResponse = undefined
                if (cacheResult === false) {
                    logger.infoLog(`fetching...`)
                    const baseURIMetadata = String(baseURI + metadataFileExtenstion)
                    logger.infoLog(baseURIMetadata)
                    metadataResponse = await axios.get(baseURIMetadata, {timeout: 3000})

                    logger.infoLog(`setting key ${metadataResponse.result}`)
                    cache.SetKey(`Metadata-${contractAddress}`, metadataResponse)
                }

                if(metadataResponse === undefined)
                {
                    res.status(404).send(`No metadata found at base_uri`)
                }
                else
                {
                    const response = Metadata
                    (
                        metadataResponse.data.name, 
                        metadataResponse.data.description, 
                        metadataResponse.data.external_url, 
                        metadataResponse.data.animation_url,
                        metadataResponse.data.collection_image_url,
                        metadataResponse.data.discord,
                        metadataResponse.data.twitter,
                        metadataResponse.data.telegram
                    )
                    res.send(response)
                }
            }
        }
        catch(e){
            res.status(404).send(`Error: No metadata found at base_uri`)
        }
    }
}
