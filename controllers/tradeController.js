const userDAO = require("../services/DAO/userDAO");
const tradeDAO = require("../services/DAO/tradeDAO");
const validateTradeApis = require("../services/validateTradeApis");

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
    this.tradeRouter.post("/cancel", this.cancelOrder);
  }

  async getOrders(_req, res, next) {
    const userId = 1;

    let orders = await tradeDAO.getOrders(userId);

    res.render("orders", {
      orders,
    });
    next();
  }

  async createNewOrder(req, res, next) {
    try {
      const userId = 1;

      let { instrument, quantity, price, orderType } = req.body;
      orderType = orderType.toUpperCase();

      let status = "OPEN";

      let date = new Date();
      let hr = date.getHours();
      let min = date.getMinutes();
      let sec = date.getSeconds();
      let time = `${hr}:${min}:${sec}`;

      await tradeDAO.createNewOrder(
        userId,
        orderType,
        instrument,
        quantity,
        price,
        status,
        time
      );

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

  async updateOrder(req, res, next) {
    const userId = 1;
    let { orderId, quantity, price, orderType } = req.body;
    orderType = orderType.toUpperCase();

    try {
      let placedOrderDetails = res.locals.orderDetails;
      let userFunds = await userDAO.getUserFunds(userId);

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

  async cancelOrder(req, res, next) {
    const userId = 1;
    const { orderId, orderStatus } = req.body;
    try {
      tradeDAO.cancelOrder(orderId, orderStatus);
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
