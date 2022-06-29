const express = require('express')
const userFungibleController = require('../controllers/user-fungible-controller.js')
const router = express.Router()

// get all with query options
router.get('/:walletAddress', userFungibleController.GetFungibleForAddress)

module.exports = router