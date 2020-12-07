const userDAO = require("../services/DAO/userDAO");
const validateUserApis = require("../services/validateUserApis");

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
   * this method fetches user portfolio(holdings and profit and losses)
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
   * this method fetches all the instruments added by the user
   */
  async getUserInstruments(_req, res, next) {
    const userId = 1;
    let userInstruments = await userDAO.getUserInstruments(userId);
    res.render("instruments", { userInstruments });
  }

  /**
   * this method adds new instrument by the user
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
   * this method deletes the instrument added by the user
   */
  async deleteInstrument(req, res, next) {
    const userId = 1;
    const name = req.body.name.toUpperCase();
    await userDAO.removeInstrument(userId, name);
    res.redirect("/user/instruments");
  }

  /**
   * this method adds fund for the user
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
