const express = require('express')
const orderTransactionController = require('../controllers/order-transaction-controller')
const router = express.Router()

router.get('/listed/:orderID', orderTransactionController.getListedTransactionHashForOrderID)
router.get('/sold/:orderID', orderTransactionController.getSoldTransactionHashForOrderID)

module.exports = router