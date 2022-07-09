const logger = require("../logger");
const { Metadata } = require("../models/metadata");
const { GetTokenBaseURI } = require("../utils/nftUtils");
const axios = require("axios");
const { reset } = require("nodemon");


const metadataFileExtenstion = `metadata.json`

module.exports = {

    getMetadataForCollection: async function(req, res) 
    {
        try
        {
            const contractAddress = String(req.params.contractAddress).toLowerCase()

            if(contractAddress.startsWith(`ipfs://`))
            {
                contractAddress.replace('ipfs://', 'https://ipfs.io/ipfs/')
            }
            if(contractAddress.startsWith(`ar://`))
            {
                contractAddress.replace('ar://', 'https://xqozxxt2juqo5ubrsd3gzsrznsj7ev5qhghtctqfkg2thfay.arweave.net/')
            }

            logger.infoLog(`got contractAddress ${contractAddress}`)

            const baseURI = await GetTokenBaseURI(contractAddress)

            logger.infoLog(`got baseURI ${baseURI}`)
            
            if(baseURI === undefined || baseURI == "")
            {
                logger.errorLog(`fucked it ${baseURI}`)
                res.status(404).send(`No base_uri set`)
            }
            else
            {
                logger.infoLog(`Attempting to find metadata at ${baseURI + metadataFileExtenstion}`)
                
                const metadataResponse = await axios.get(baseURI + metadataFileExtenstion)
                logger.infoLog(metadataResponse)
                
                if(metadataResponse === undefined)
                {
                    res.status(404).send(`No metadata found at base_uri`)
                }
                else
                {
                    const response = Metadata(metadataResponse.data.name, 
                        metadataResponse.data.description, 
                        metadataResponse.data.external_url, 
                        metadataResponse.data.animation_url,
                        metadataResponse.data.collection_image_url)

                    res.send(response)
                }
            }        
        }
        catch(e){
            res.status(404).send(`No metadata found at base_uri`)
        }
    }
}
