const listing = require('../models/order-transaction')

module.exports = {
    getListedTransactionHashForOrderID: async function(req, res) {
    const orderID = req.params.orderID

      let transactionHash = await order.getListedTransactionHashForOrderID(orderID)
      res.send(transactionHash)
  },
    getSoldTransactionHashForOrderID: async function(req, res) {
        const orderID = req.params.orderID

        let transactionHash = await order.getSoldTransactionHashForOrderID(orderID)
        res.send(transactionHash)
    }
}