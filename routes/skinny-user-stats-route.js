const express = require('express')
const skinnyUserStatsController = require('../controllers/skinny-user-stats-controller')
const router = express.Router()

// get all with query options
router.get('/', skinnyUserStatsController.getSkinnyUserStats)

// get a user row TODO

module.exports = router