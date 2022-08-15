const express = require('express')
const orderTransactionController = require('../controllers/order-transaction-controller')
const router = express.Router()

router.get('/listed', orderTransactionController.getListedTransactionHashForOrderID)
router.get('/sold', orderTransactionController.getSoldTransactionHashForOrderID)

module.exports = router