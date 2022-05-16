const express = require('express')
const calendarController = require('../controllers/calendar-controller')
const router = express.Router()

router.get('/', calendarController.GetCalendarForPeriod)

module.exports = router