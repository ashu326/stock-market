/**
 * This class validates all the user related requests
 */
class ValidateUserApis {
  /**
   * This method validates funds to be added by the user
   * @param {object} req - incoming request object
   * @param {object} res - outgoing request object
   * @param {function} next - next middleware in the request chain
   */
  validateAddFunds(req, res, next) {
    try {
      let amount = req.body.amount;
      if (amount < 0) {
        throw "Enter valid amount";
      }
    } catch (err) {
      res.render("error", { err });
    }
    next();
  }
}

module.exports = new ValidateUserApis();
