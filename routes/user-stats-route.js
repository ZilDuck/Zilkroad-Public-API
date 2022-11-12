const express = require('express')
const userStatsController = require('../controllers/user-stats-controller')
const router = express.Router()

// get all with query options
// TODO - is this even used?
router.get('/', userStatsController.getUserStats)

module.exports = router