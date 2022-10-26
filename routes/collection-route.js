const express = require('express')
const collectionController = require('../controllers/collection-controller')
const router = express.Router()

router.get('/:contractAddress', collectionController.getCollection)
router.get('/:contractAddress/activity', collectionController.getCollectionActivity)
router.get('/:contractAddress/nfts', collectionController.getCollectionNfts)
router.get('/:contractAddress/listedNfts', collectionController.getCollectionListedNfts)
router.get('/', collectionController.getCollections)

module.exports = router