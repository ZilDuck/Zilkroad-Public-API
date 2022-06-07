const express = require('express')
const collectionRankController = require('../controllers/collection-ranks-controller')
const router = express.Router()

router.get('/', collectionRankController.getAllCollectionRanks)
router.get('/:contractAddress', collectionRankController.getACollectionRank)



module.exports = router