const express = require('express')
const collectionStatsController = require('../controllers/collection-stats-controller')
const router = express.Router()

router.get('/', collectionStatsController.getCollectionStats)

module.exports = router