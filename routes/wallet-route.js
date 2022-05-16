const express = require('express')
const walletController = require('../controllers/wallet-controller')
const router = express.Router()

router.get('/:walletAddress', walletController.getWallet)
router.get('/:walletAddress/nfts', walletController.getWalletNfts)
router.get('/:walletAddress/listedNfts', walletController.getWalletListedNfts)

module.exports = router