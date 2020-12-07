/**
 * This file starts up the express server, it requires everything that is needed to be run in project.
 */
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./client/db");
const { serverConfig } = require("./config/config");
const userController = require("./controllers/userController").userController;
const tradeController = require("./controllers/tradeController")
  .tradeController;
const userDAO = require("./services/DAO/userDAO");

/**
 * express app initialised
 */
const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

/**
 * body parser to retrieve data from body
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userRouter = express.Router();
const tradeRouter = express.Router();

/**
 * Calling userController helper function
 */
app.use("/user", userRouter);
userController(userRouter);

app.use("/orders", tradeRouter);
tradeController(tradeRouter);

app.get("/", async (req, res, next) => {
  const userId = 1;
  let funds = await userDAO.getUserFunds(userId);
  res.render("main", { funds });
  next();
});

db.connection()
  .then(
    app.listen(serverConfig.PORT, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`server listening at ${serverConfig.PORT}`);
      }
    })
  )
  .catch((err) => {
    console.log(err);
  });
