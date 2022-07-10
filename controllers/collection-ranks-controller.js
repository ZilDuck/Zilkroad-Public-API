const cache = require('../cache/cache.js')
const contractRanks = require('../models/contract-ranks')
const contract = require('../models/contract')

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
            
            for(const data of fetchData)
            {
                const contractData = await contract.GetContract(data.nonfungible_address)
                console.log(contractData)
                data.royalty_bps = contractData.royalty_bps
                data.is_verified = contractData.is_verified
                data.nfts_minted = contractData.nfts_minted
                data.sales_history = contractData.sales_history
                data.primary_sales = contractData.primary_sales
                data.stats = contractData.stats
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

            const contractData = await contract.GetContract(fetchData[0].nonfungible_address)
            fetchData[0].royalty_bps = contractData.royalty_bps
            fetchData[0].is_verified = contractData.is_verified
            fetchData[0].nfts_minted = contractData.nfts_minted
            fetchData[0].sales_history = contractData.sales_history
            fetchData[0].primary_sales = contractData.primary_sales
            fetchData[0].stats = contractData.stats

            cache.SetKey(`getACollectionRank-${contractAddress}-${timeFrom}-${timeTo}`, fetchData)
            res.send(fetchData)
        } else {
            res.send(cacheResult)
        }
    }
}
