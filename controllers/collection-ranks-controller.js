const cache = require('../cache/cache.js')
const contractRanks = require('../models/contract-ranks')
const contract = require('../models/contract')
const { toBech32Address, fromBech32Address, validation } = require('@zilliqa-js/zilliqa')
const addressUtil = require('../utils/addressUtils.js')

const cacheTime = 30

module.exports = {
    getAllCollectionRanks: async function(req, res)
    {
        const page = req.query.page ?? 0
        const limit = req.query.limit ?? 20
        const timeFrom = req.query.timeFrom ?? 0
        const timeTo = req.query.timeTo ?? 99999999999999

        const cacheResult = await cache.GetKey(`getAllCollectionRanks-${page}-${limit}-${timeFrom}-${timeTo}`)
        if (cacheResult === false) {
            const fetchData = await contractRanks.DBGetAllCollectionRanks(page, limit, timeFrom, timeTo).catch((error) => {
                res.status(404).send({"message": error})
                return
            })
            
            for(const data of fetchData)
            {
                const contractData = await contract.GetContract(data.nonfungible_address).catch((error) => {
                    res.status(404).send({"message": error})
                    return
                })
                data.royalty_bps = contractData.royalty_bps
                data.is_verified = contractData.is_verified
                data.nfts_minted = contractData.nfts_minted
                data.sales_history = contractData.sales_history
                data.primary_sales = contractData.primary_sales
                data.stats = contractData.stats
                data.contract_address_b32 = validation.isBech32(data.nonfungible_address) ? data.nonfungible_address : toBech32Address(data.nonfungible_address)
            }
            await cache.SetKey(`getAllCollectionRanks-${page}-${limit}-${timeFrom}-${timeTo}`, fetchData, cacheTime)
            res.send(fetchData)
        } else {
            res.send(cacheResult)
        }
    },


    getACollectionRank: async function(req, res)
    {
        const contractAddress = addressUtil.NormaliseAddressToBase16(req.params.contractAddress)
        const timeFrom = req.params.timeFrom ?? 0
        const timeTo = req.query.timeTo ?? 99999999999999

        const cacheResult = await cache.GetKey(`getACollectionRank-${contractAddress}-${timeFrom}-${timeTo}`)
        if (cacheResult === false) {
            const fetchData = await contractRanks.DBGetACollectionRank(contractAddress, timeFrom, timeTo).catch((error) => {
                res.status(404).send({"message": error})
                return
            })

            if (fetchData.length === 0) {
                res.status(404).send({"message": "Unable to find data for collection"})
                return
            }

            const contractData = await contract.GetContract(fetchData[0].nonfungible_address).catch((error) => {
                res.status(404).send({"message": error})
                return
            })
            fetchData[0].royalty_bps = contractData.royalty_bps
            fetchData[0].is_verified = contractData.is_verified
            fetchData[0].nfts_minted = contractData.nfts_minted
            fetchData[0].sales_history = contractData.sales_history
            fetchData[0].primary_sales = contractData.primary_sales
            fetchData[0].stats = contractData.stats

            await cache.SetKey(`getACollectionRank-${contractAddress}-${timeFrom}-${timeTo}`, fetchData, cacheTime)
            res.send(fetchData)
        } else {
            res.send(cacheResult)
        }
    }
}
