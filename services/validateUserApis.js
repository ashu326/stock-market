class ValidateUserApis {
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
