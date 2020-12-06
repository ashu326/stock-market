const { Client } = require("pg");
const { dbConfig } = require("../config/config");

const client = new Client(dbConfig);

let connection = async () => {
  try {
    await client.connect();
    console.log("database connected...");
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  client,
  connection,
};

// const mysql = require("mysql");
// // const { dbConfig } = require("../config/config");

// let connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "smallcase",
// });

// let db = connection.connect(function (err) {
//   if (err) {
//     return console.error("error: " + err.message);
//   }

//   console.log("Connected to the MySQL server.");
// });

// module.exports = db;
