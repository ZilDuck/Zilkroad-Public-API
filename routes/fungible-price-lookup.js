const express = require('express')
const fungiblePriceLookupController = require('../controllers/fungible-price-lookup-controller')
const router = express.Router()

router.get('/:fungible_symbol/:fungible_amount', fungiblePriceLookupController.lookupPrice)

module.exports = router