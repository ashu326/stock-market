/**
 * script to enter dummy values in db tables
 */
require("dotenv").config();
const { Client } = require("pg");
const { dbConfig } = require("./config/config");

createDbEntries = async () => {
  try {
    const client = new Client(dbConfig);
    await client.connect();

    client.query(`create table funds(user_id int, amount float);`);

    client.query(`insert into funds values (1, 20000);`);

    client.query(`CREATE TABLE portfolio(
        user_id int,
        instrument varchar(20),
        quantity int,
        avg_cost float,
        ltp float
    )`);

    client.query(`INSERT INTO portfolio VALUES (1, 'ASHOKA', 35, 64.23, 86.55),
	(1, 'AXISBANK', 3, 433, 614.5),
	(1, 'BANDHANBNK', 10, 280, 393.4),
	(1, 'BANKBARODA', 100, 41.8, 59.05),
	(1, 'BHARTIARTL', 15, 482, 493.90),
	(1, 'BRITANIA', 2, 3660, 3648),
	(1, 'BSOFT', 5, 104, 188.5),
	(1, 'DEEPAKNTR', 3, 762, 845.05),
	(1, 'FEDERALBNK', 250, 53.10, 66),
	(1, 'GAIL', 30, 90.16, 119.8),
	(1, 'HDFC', 1, 1586.50, 2245.9),
	(1, 'HDFCBANK', 3, 888.67, 1385.6),
	(1, 'HDFCLIFE', 15, 595.53, 643.25),
	(1, 'HINDPETRO*', 10, 211.80, 216.6),
	(1, 'HINDUNILVR', 3, 2049.63, 2184.2),
	(1, 'ICICIBANK', 30, 401.16, 502.15),
	(1, 'INDUSINDBK', 12, 612, 913.65),
	(1, 'INFY', 30, 1080.66, 1134.65),
	(1, 'ITC', 30, 168.93, 198.15),
	(1, 'NETWORK18', 28, 44.65, 36.70),
    (1, 'YESBANK', 1000, 12, 15.33)`);

    client.query(
      `CREATE TABLE instruments(user_id int, name varchar(20), ltp float)`
    );
    client.query(
      `insert into instruments values(1, 'ASHOKA', 100), (1, 'GAIL', 100)`
    );

    client.query(`CREATE TABLE ORDERS(id serial, user_id int, type varchar(10), instrument varchar(20), quantity int, price float, status varchar(20), time varchar(30))
    `);

    await client.end();
  } catch (err) {
    console.log(err);
  }
};

createDbEntries();
