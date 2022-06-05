const {getTokens} = require("../models/token");
module.exports = {

    getMarketplaceListings: async function(req, res) {
        const page = req.params.page ?? 0
        const filter = req.query.filter ?? 'recently-listed'
        const limit = req.query.limit ?? 10
        const order = req.query.order ?? 'ASC'
        const orderBy = req.query.orderBy ?? ''

        const { nfts } = await getTokens(filter, limit, page, order, orderBy)
        const collections = nfts.map(({ collection_name, contract_address_b16 }) => ({
            label: collection_name,
            value: contract_address_b16,
        }))
        const uniqueCollections = [...new Map(collections.map(collection => [collection.value, collection])).values()]

        const response = {
            nfts: nfts,
            collections: uniqueCollections
        }
        res.send(response)
    }
}