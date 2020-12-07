const userDAO = require("../services/DAO/userDAO");
const tradeDAO = require("../services/DAO/tradeDAO");
const validateTradeApis = require("../services/validateTradeApis");

/**
 * This class handles all the business logic related to trade
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
   * This method fetches all the orders placed by the user on a day
   * @param {object} _req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
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
   * This method places new order by the user
   * @param {object} req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  async createNewOrder(req, res, next) {
    try {
      const userId = 1;

      let { instrument, quantity, price, orderType } = req.body;
      orderType = orderType.toUpperCase();
      instrument = instrument.toUpperCase();

      let status = "OPEN";

      /**
       * create entry in db for new order
       * @param {object} req - incoming request object
       * @param {object} res - outgoing request object
       * @param {function} next - next middleware in the request chain
       */
      await tradeDAO.createNewOrder(
        userId,
        orderType,
        instrument,
        quantity,
        price,
        status
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
   * This method updates placed order which is open to be executed
   * @param {object} req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
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

      /**
       * update order and user funds after order modification
       */
      await Promise.all([
        tradeDAO.updateUserOrder(
          placedOrderDetails.id,
          orderType,
          quantity,
          price
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
   * This method cancels an open order
   * @param {object} req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  async cancelOrder(req, res, next) {
    const userId = 1;
    let { orderId, orderStatus } = req.body;
    orderStatus = orderStatus.toUpperCase();
    try {
      /**
       * cancel the order
       */
      await tradeDAO.cancelOrder(orderId, orderStatus);
      let placedOrderType = res.locals.orderDetails.type.toUpperCase();

      /**
       * refund the user if buy order was placed
       */
      if (placedOrderType == "BUY") {
        let userFunds = await userDAO.getUserFunds(userId);

        userFunds += res.locals.refundAmount;

        await userDAO.updateUserFunds(userId, userFunds);
      }

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
