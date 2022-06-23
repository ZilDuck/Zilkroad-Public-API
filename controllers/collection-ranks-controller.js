const cache = require('../cache/cache.js')
const contractRanks = require('../models/contract-ranks')
const nftUtils = require('../utils/nftUtils')

module.exports = {
    getAllCollectionRanks: async function(req, res)
    {
        const page = req.query.page ?? 0
        const limit = req.query.limit ?? 20
        const timeFrom = req.query.timeFrom ?? 0
        const timeTo = req.query.timeTo ?? 99999999999999

        const cacheResult = cache.GetKey(`getAllCollectionRanks-${page}-${limit}-${timeFrom}-${timeTo}`)
        if (cacheResult === false) {
            const fetchData = await contractRanks.DBGetAllCollectionRanks(page, limit, timeFrom, timeTo)
            
            // Could call contract.GetContract to get a fatter object which includes total listed
            // 1) use fat object + do more with the data on this page
            // 2) use skinny object (DONE) + add count query 
            for(const data of fetchData)
            {
                const bps = await nftUtils.GetRoyaltyBPSForToken(data.nonfungible_address)
                const idCount = await nftUtils.GetTokenIDCount(data.nonfungible_address)
                data.bps = bps
                data.idCount = idCount
            }
            cache.SetKey(`getAllCollectionRanks-${page}-${limit}-${timeFrom}-${timeTo}`, fetchData)
            res.send(fetchData)
        } else {
            res.send(cacheResult)
        }
    },


    getACollectionRank: async function(req, res)
    {
        const contractAddress = req.params.contractAddress
        const timeFrom = req.params.timeFrom ?? 0
        const timeTo = req.query.timeTo ?? 99999999999999

        const cacheResult = cache.GetKey(`getACollectionRank-${contractAddress}-${timeFrom}-${timeTo}`)
        if (cacheResult === false) {
            const fetchData = await contractRanks.DBGetACollectionRank(contractAddress, timeFrom, timeTo)
            cache.SetKey(`getACollectionRank-${contractAddress}-${timeFrom}-${timeTo}`, fetchData)
            res.send(fetchData)
        } else {
            res.send(cacheResult)
        }
    }
}