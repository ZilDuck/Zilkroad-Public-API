const orderTransaction = require('../models/order-transaction')

// No cache - Discord bot use once

module.exports = {
    getListedTransactionHashForOrderID: async function(req, res) {
    const orderID = req.params.orderID

      let transactionHash = await orderTransaction.getListedTransactionHashForOrderID(orderID).catch((error) => {
          res.status(404).send({"message": error})
          return
      })
      res.send(transactionHash)
  },
    getSoldTransactionHashForOrderID: async function(req, res) {
        const orderID = req.params.orderID

        let transactionHash = await orderTransaction.getSoldTransactionHashForOrderID(orderID).catch((error) => {
            res.status(404).send({"message": error})
            return
        })
        res.send(transactionHash)
    }
}