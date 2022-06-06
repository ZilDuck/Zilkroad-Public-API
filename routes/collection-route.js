const express = require('express')
const collectionController = require('../controllers/collection-controller')
const router = express.Router()

router.get('/rank', collectionController.getAllCollectionRanks)
router.get('/rank/:contractAddress', collectionController.getACollectionRank)

router.get('/:contractAddress', collectionController.getCollection)
router.get('/:contractAddress/nfts', collectionController.getCollectionNfts)
router.get('/', collectionController.getCollections)

module.exports = router