const express = require('express')
const reportController = require('../controllers/report-controller')
const router = express.Router()

router.get('/:contract/:user', reportController.reportContract)

module.exports = router