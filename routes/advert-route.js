const express = require('express')
const advertController = require('../controllers/advert-controller')
const router = express.Router()

router.get('/', advertController.getAdvert)

module.exports = router