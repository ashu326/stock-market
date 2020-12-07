const userDAO = require("../services/DAO/userDAO");
const tradeDAO = require("../services/DAO/tradeDAO");
const validateTradeApis = require("../services/validateTradeApis");

/**
 * this class handles all the business logic related to trade
 */
class TradeController {
  constructor(tradeRouter) {
    this.tradeRouter = tradeRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.tradeRouter.get("/", this.getOrders);
    this.tradeRouter.post(
      "/new",
      validateTradeApis.validateOrder.bind(validateTradeApis),
      this.createNewOrder
    );
    this.tradeRouter.post(
      "/update",
      validateTradeApis.validateOrderUpdate.bind(validateTradeApis),
      this.updateOrder
    );
    this.tradeRouter.post(
      "/cancel",
      validateTradeApis.validateCancelOrder,
      this.cancelOrder
    );
  }

  /**
   * this method fetches all the orders placed by the user in a day
   */
  async getOrders(_req, res, next) {
    const userId = 1;

    let orders = await tradeDAO.getOrders(userId);

    res.render("orders", {
      orders,
    });
    next();
  }

  /**
   * this method places new order by the user
   */
  async createNewOrder(req, res, next) {
    try {
      const userId = 1;

      let { instrument, quantity, price, orderType } = req.body;
      orderType = orderType.toUpperCase();
      instrument = instrument.toUpperCase();

      let status = "OPEN";

      let date = new Date();
      let hr = date.getHours();
      let min = date.getMinutes();
      let sec = date.getSeconds();
      let time = `${hr}:${min}:${sec}`;

      /**
       * create entry in db for new order
       */
      await tradeDAO.createNewOrder(
        userId,
        orderType,
        instrument,
        quantity,
        price,
        status,
        time
      );

      /**
       * if order type is buy then detuct user funds
       */
      if (orderType == "BUY") {
        let userFunds = res.locals.userFunds;
        userFunds = userFunds - price * quantity;
        await userDAO.updateUserFunds(userId, userFunds);
      }

      res.redirect("/orders");
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * this method updates placed order which is open to be executed
   */
  async updateOrder(req, res, next) {
    const userId = 1;
    let { orderId, quantity, price, orderType } = req.body;
    orderType = orderType.toUpperCase();

    try {
      let placedOrderDetails = res.locals.orderDetails;
      let userFunds = await userDAO.getUserFunds(userId);

      /**
       * modify user funds according to the modification
       */
      if (placedOrderDetails.type == "BUY" && orderType == "BUY") {
        let deductedFunds =
          placedOrderDetails.quantity * placedOrderDetails.price;
        userFunds = userFunds + deductedFunds;
        userFunds = userFunds - quantity * price;
      }

      if (placedOrderDetails.type == "BUY" && orderType == "SELL") {
        let deductedFunds =
          placedOrderDetails.quantity * placedOrderDetails.price;
        userFunds = userFunds + deductedFunds;
      }

      if (placedOrderDetails.type == "SELL" && orderType == "BUY") {
        userFunds = userFunds - quantity * price;
      }

      let date = new Date();
      let hr = date.getHours();
      let min = date.getMinutes();
      let sec = date.getSeconds();
      let time = `${hr}:${min}:${sec}`;

      /**
       * update order and user funds after order modification
       */
      await Promise.all([
        tradeDAO.updateUserOrder(
          placedOrderDetails.id,
          orderType,
          quantity,
          price,
          time
        ),
        userDAO.updateUserFunds(userId, userFunds),
      ]);

      res.redirect("/orders");
    } catch (err) {
      console.log(err);
    }
    next();
  }

  /**
   * this method cancels an open order
   */
  async cancelOrder(req, res, next) {
    const userId = 1;
    let { orderId, orderStatus } = req.body;
    orderStatus = orderStatus.toUpperCase();
    try {
      let date = new Date();
      let hr = date.getHours();
      let min = date.getMinutes();
      let sec = date.getSeconds();
      let time = `${hr}:${min}:${sec}`;

      /**
       * cancel the order
       */
      await tradeDAO.cancelOrder(orderId, orderStatus, time);

      let userFunds = await userDAO.getUserFunds(userId);

      /**
       * refund the user
       */
      userFunds += res.locals.refundAmount;

      await userDAO.updateUserFunds(userId, userFunds);

      res.redirect("/orders");
    } catch (err) {
      console.log(err);
    }
    next();
  }
}

const tradeController = (tradeRouter) => new TradeController(tradeRouter);

module.exports = {
  tradeController,
  TradeController,
};
