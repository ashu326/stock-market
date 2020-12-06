const userDAO = require("./DAO/userDAO");
const tradeDAO = require("./DAO/tradeDAO");

class ValidateTradeApis {
  async validateOrder(req, res, next) {
    const userId = 1;
    try {
      let orderType = req.body.orderType.toUpperCase();
      let instrument = req.body.instrument.toUpperCase();
      const quantity = req.body.quantity;
      const price = req.body.price;

      if (orderType == "SELL") {
        await this.validateUserHoldings(userId, instrument, quantity, res);
      }

      if (orderType == "BUY") {
        let placeOrderPrice = 0;
        await this.validateUserFunds(
          userId,
          price,
          quantity,
          placeOrderPrice,
          res
        );
      }
    } catch (err) {
      res.render("error", { err });
      return;
    }
    next();
  }

  async validateOrderUpdate(req, res, next) {
    let { orderId, quantity, price, orderType } = req.body;
    let userId = 1;
    orderType = orderType.toUpperCase();
    try {
      let orderDetails = await tradeDAO.getUserOrder(orderId);

      if (orderDetails == undefined) {
        throw "invalid order no";
      }

      res.locals.orderDetails = orderDetails;

      if (orderType == "SELL") {
        await this.validateUserHoldings(
          userId,
          orderDetails.instrument,
          quantity,
          res
        );
      }

      if (orderType == "BUY") {
        let placeOrderPrice = orderDetails.quantity * orderDetails.price;
        await this.validateUserFunds(
          userId,
          price,
          quantity,
          placeOrderPrice,
          res
        );
      }
    } catch (err) {
      res.render("error", { err });
      return;
    }
    next();
  }

  async validateUserFunds(userId, price, quantity, placeOrderPrice, res) {
    try {
      let userFunds = await userDAO.getUserFunds(userId);
      res.locals.userFunds = userFunds;
      userFunds = userFunds + placeOrderPrice;

      if (userFunds < price * quantity) {
        throw "insufficient funds";
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async validateUserHoldings(userId, instrument, quantity, res) {
    try {
      let holdingDetails = await userDAO.getUserHoldingDetails(
        userId,
        instrument
      );

      if (holdingDetails.length == 0) {
        throw "user dont have this holding.....";
      }

      if (holdingDetails[0].quantity < quantity) {
        throw `user has less holding than ${quantity}`;
      }

      res.locals.holdingDetails = holdingDetails;
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = new ValidateTradeApis();
