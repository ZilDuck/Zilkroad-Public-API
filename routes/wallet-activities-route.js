const express = require('express')
const walletController = require('../controllers/wallet-controller')
const router = express.Router()

router.get('/', walletController.getRankedWalletActivitiesByType)

module.exports = router