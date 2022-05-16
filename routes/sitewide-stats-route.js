const express = require('express')
const sitewideStatsController = require('../controllers/sitewide-stats-controller')
const router = express.Router()

// get all with query options
router.get('/', sitewideStatsController.GetSitewideStats)

module.exports = router