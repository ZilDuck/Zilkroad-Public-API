const express = require('express')
const advertController = require('../controllers/advert-controller')
const router = express.Router()

router.get('/:advertId', advertController.getAdvert)
router.get('/', advertController.getAdverts)

module.exports = router