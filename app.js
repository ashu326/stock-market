require("dotenv").config();
const express = require("express");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./client/db");
const { serverConfig } = require("./config/config");
const userController = require("./controllers/userController").userController;
const tradeController = require("./controllers/tradeController")
  .tradeController;
const userDAO = require("./services/DAO/userDAO");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

/**
 * body parser to retrieve data from body
 */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

const userRouter = express.Router();
const tradeRouter = express.Router();

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
