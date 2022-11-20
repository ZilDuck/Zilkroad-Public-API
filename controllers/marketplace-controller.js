const {getTokens} = require("../models/token");
const cache = require('../cache/cache.js')

const cacheTime = 30

module.exports = {

    getMarketplaceListings: async function(req, res) {
        const page = req.params.page ?? 0
        const filter = req.query.filter ?? 'recently-listed'
        const limit = req.query.limit ?? 28
        const order = req.query.order ?? 'ASC'
        const orderBy = req.query.orderBy ?? ''
        const contract_address = req.query.contract

        const cacheResult = await cache.GetKey(`Marketplace-${page}/${filter}/${limit}/${order}/${orderBy}/${contract_address}`)
        if (cacheResult === false) 
        {
            const { nfts, pagination } = await getTokens(filter, limit, page, order, orderBy, contract_address).catch((error) => {
                res.status(404).send({"message": error})
                return
            })
            const collections = nfts.map(({ collection_name, contract_address_b16 }) => ({
                label: collection_name,
                value: contract_address_b16,
            }))
            const uniqueCollections = [...new Map(collections.map(collection => [collection.value, collection])).values()]

            const response = {
                nfts: nfts,
                pagination,
                collections: uniqueCollections
            }

            await cache.SetKey(`Marketplace-${page}/${filter}/${limit}/${order}/${orderBy}/${contract_address}`, response, cacheTime)

            res.send(response)
        }
        else
        {
            res.send(cacheResult)
        }
    }
}