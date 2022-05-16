const express = require('express')
const nftController = require('../controllers/nft-controller')
const router = express.Router()

router.get('/:contractAddress/:tokenId', nftController.getNft)
router.get('/', nftController.getNfts)

router.get('/:contractAddress/:tokenId/spender', nftController.getNftSpender)
router.get('/:contractAddress/:userAddress/allowance', nftController.getFungibleAllowance)

module.exports = router