const express = require('express')
const metadataController = require("../controllers/metadata-controller");
const router = express.Router()

router.get('/:contractAddress', metadataController.getMetadataForCollection)

module.exports = router