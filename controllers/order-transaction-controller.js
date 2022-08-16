const orderTransaction = require('../models/order-transaction')

module.exports = {
    getListedTransactionHashForOrderID: async function(req, res) {
    const orderID = req.params.orderID

      let transactionHash = await orderTransaction.getListedTransactionHashForOrderID(orderID)
      res.send(transactionHash)
  },
    getSoldTransactionHashForOrderID: async function(req, res) {
        const orderID = req.params.orderID

        let transactionHash = await orderTransaction.getSoldTransactionHashForOrderID(orderID)
        res.send(transactionHash)
    }
}