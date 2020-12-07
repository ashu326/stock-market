const userDAO = require("../services/DAO/userDAO");
const validateUserApis = require("../services/validateUserApis");

/**
 * This class handles all the business logic related to trade
 */
class UserController {
  constructor(userRouter) {
    this.userRouter = userRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.userRouter.get("/holdings", this.getHoldings);
    this.userRouter.get("/instruments", this.getUserInstruments);
    this.userRouter.post("/addInstrument", this.addUserInstrument);
    this.userRouter.post("/deleteInstrument", this.deleteInstrument);
    this.userRouter.post(
      "/addfund",
      validateUserApis.validateAddFunds,
      this.addFunds
    );
  }

  /**
   * This method fetches user portfolio(holdings, profit and losses)
   * @param {object} _req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  async getHoldings(_req, res, next) {
    const userId = 1;
    let userHoldings = await userDAO.getUserHoldings(userId);

    userHoldings = userHoldings.map((holding) => {
      let pl = (holding.quantity * (holding.ltp - holding.avg_cost)).toFixed(2);
      let invested_value = (holding.quantity * holding.avg_cost).toFixed(2);
      return {
        instrument: holding.instrument,
        quantity: holding.quantity,
        avg_cost: holding.avg_cost,
        ltp: holding.ltp,
        curr_val: invested_value,
        pl,
        net_change: ((pl / invested_value) * 100).toFixed(2),
      };
    });

    let totalInvestment = 0,
      currentValue = 0;

    for (let idx = 0; idx < userHoldings.length; idx++) {
      totalInvestment +=
        userHoldings[idx].quantity * userHoldings[idx].avg_cost;
      currentValue += userHoldings[idx].quantity * userHoldings[idx].ltp;
    }

    totalInvestment = totalInvestment.toFixed(2);
    currentValue = currentValue.toFixed(2);

    let pl = (currentValue - totalInvestment).toFixed(2);
    let plPercentage = ((pl / totalInvestment) * 100).toFixed(2);

    res.render("holdings", {
      userHoldings,
      totalInvestment,
      currentValue,
      pl,
      plPercentage,
    });
    next();
  }

  /**
   * This method fetches all the instruments added by the user
   * @param {object} _req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  async getUserInstruments(_req, res, next) {
    const userId = 1;
    let userInstruments = await userDAO.getUserInstruments(userId);
    res.render("instruments", { userInstruments });
  }

  /**
   * This method adds a new instrument by the user
   * @param {object} req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  async addUserInstrument(req, res, next) {
    const userId = 1;
    let name = req.body.name;
    let ltp = 100;
    await userDAO.addUserInstrument(userId, name, ltp);

    res.redirect("/user/instruments");
    next();
  }

  /**
   * This method deletes the instrument added by the user
   * @param {object} req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  async deleteInstrument(req, res, next) {
    const userId = 1;
    const name = req.body.name.toUpperCase();
    await userDAO.removeInstrument(userId, name);
    res.redirect("/user/instruments");
  }

  /**
   * This method adds fund for the user
   * @param {object} req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  async addFunds(req, res, next) {
    try {
      let amount = req.body.amount;
      let userId = 1;

      let userFunds = await userDAO.getUserFunds(userId);
      userFunds += parseInt(amount);
      await userDAO.updateUserFunds(userId, userFunds);

      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  }
}

const userController = (userRouter) => new UserController(userRouter);

module.exports = {
  userController,
  UserController,
};
