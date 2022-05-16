const express = require('express')
const cacheController = require('../controllers/cache-controller')
const router = express.Router()

router.get('/', cacheController.getCacheStats)
router.get('/clear', cacheController.clearCache)

module.exports = router