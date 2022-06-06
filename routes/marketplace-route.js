const express = require('express')
const marketplaceController = require("../controllers/marketplace-controller");
const router = express.Router()

router.get('/', marketplaceController.getMarketplaceListings)

module.exports = router