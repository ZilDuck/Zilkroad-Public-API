const express = require('express')
const primarySalesController = require('../controllers/primary-sales-controller')
const router = express.Router()

router.get('/:limit/:offset', primarySalesController.getPrimarySales)

module.exports = router