module.exports = {

    getMarketplaceListings: async function(req, res) {
        const response = {
            nfts: [],
            collections: []
        }
        res.send(response)
    }
}