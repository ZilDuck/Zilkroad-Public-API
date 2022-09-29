const express = require('express')
const fungibleController = require('../controllers/fungible-controller')
const router = express.Router()

router.get('/', fungibleController.getAllTokens)

module.exports = router