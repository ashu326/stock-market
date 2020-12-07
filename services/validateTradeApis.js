const userDAO = require("./DAO/userDAO");
const tradeDAO = require("./DAO/tradeDAO");

class ValidateTradeApis {
  /**
   * this function validates new order request
   */
  async validateOrder(req, res, next) {
    const userId = 1;
    try {
      let orderType = req.body.orderType.toUpperCase();
      let instrument = req.body.instrument.toUpperCase();
      const quantity = req.body.quantity;
      const price = req.body.price;

      /**
       * check if quantity and price are numbers
       */
      if (isNaN(quantity)) {
        throw "Enter valid quantity";
      }

      if (isNaN(price)) {
        throw "Enter valid price";
      }

      /**
       * check if user sends negative quantity for stocks
       */
      if (quantity < 0) {
        throw "Quantity cannot be negative";
      }

      /**
       * check if user places negative price for any stock
       */
      if (price < 0) {
        throw "Price of the stock cannot be negative";
      }

      /**
       * if order is sell type check that user has sufficent holdings to sell
       */
      if (orderType == "SELL") {
        await this.validateUserHoldings(userId, instrument, quantity, res);
      }

      /**
       * if order is buy then check if user has sufficient funds to buy the stocks
       */
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

  /**
   * this function validates update order request
   */
  async validateOrderUpdate(req, res, next) {
    let { orderId, quantity, price, orderType } = req.body;
    let userId = 1;
    orderType = orderType.toUpperCase();
    try {
      if (isNaN(orderId)) {
        throw "Invalid order no.";
      }

      if (isNaN(quantity)) {
        throw "Enter valid quantity";
      }

      if (isNaN(price)) {
        throw "Enter valid price";
      }

      if (price < 0) {
        throw "Enter valid price";
      }

      if (quantity < 1) {
        throw "Enter valid quantity";
      }

      if (orderType != "BUY" || orderType != "SELL") {
        throw "Invalid order type";
      }

      let orderDetails = await tradeDAO.getUserOrder(orderId);

      if (orderDetails == undefined) {
        throw "Invalid order no";
      }

      res.locals.orderDetails = orderDetails;

      /**
       * if order is sell type check that user has sufficent holdings to sell
       */
      if (orderType == "SELL") {
        await this.validateUserHoldings(
          userId,
          orderDetails.instrument,
          quantity,
          res
        );
      }

      /**
       * if order is buy then check if user has sufficient funds to buy the stocks
       */
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

  /**
   * this method validates if user has sufficient funds to buy the stocks
   */
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

  /**
   * this function validates if user has sufficient holdings before he sells it
   */
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

  /**
   * this function validates if cancel order params are valid
   */
  async validateCancelOrder(req, res, next) {
    try {
      let orderId = req.body.orderId;
      let userOrder = await tradeDAO.getUserOrder(orderId);

      if (userOrder == undefined) {
        throw `invalid order no.`;
      }
      res.locals.refundAmount = userOrder.price * userOrder.quantity;
    } catch (err) {
      res.render("error", { err });
      return;
    }
    next();
  }
}

module.exports = new ValidateTradeApis();
