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

    await client.query(`create table funds(user_id int, amount float);`);

    await client.query(`insert into funds values (1, 20000);`);

    await client.query(`CREATE TABLE portfolio(
        user_id int,
        instrument varchar(20),
        quantity int,
        avg_cost float,
        ltp float
    )`);

    await client.query(`INSERT INTO portfolio VALUES (1, 'ASHOKA', 35, 64.23, 100),
	(1, 'AXISBANK', 3, 433, 100),
	(1, 'BANDHANBNK', 10, 280, 100),
	(1, 'BANKBARODA', 100, 41.8, 100),
	(1, 'BHARTIARTL', 15, 482, 100),
	(1, 'BRITANIA', 2, 3660, 100),
	(1, 'BSOFT', 5, 104, 100),
	(1, 'DEEPAKNTR', 3, 762, 100),
	(1, 'FEDERALBNK', 250, 53.10, 100),
	(1, 'GAIL', 30, 90.16, 100),
	(1, 'HDFC', 1, 1586.50, 100),
	(1, 'HDFCBANK', 3, 888.67, 100),
	(1, 'HDFCLIFE', 15, 595.53, 100),
	(1, 'HINDPETRO*', 10, 211.80, 100),
	(1, 'HINDUNILVR', 3, 2049.63, 100),
	(1, 'ICICIBANK', 30, 401.16, 100),
	(1, 'INDUSINDBK', 12, 612, 100),
	(1, 'INFY', 30, 1080.66, 100),
	(1, 'ITC', 30, 168.93, 100),
	(1, 'NETWORK18', 28, 44.65, 100),
    (1, 'YESBANK', 1000, 12, 100)`);

    await client.query(
      `CREATE TABLE instruments(user_id int, name varchar(20), ltp float)`
    );
    await client.query(
      `insert into instruments values(1, 'ASHOKA', 100), (1, 'GAIL', 100)`
    );

    await client.query(`CREATE TABLE ORDERS(id serial, user_id int, type varchar(10), instrument varchar(20), quantity int, price float, status varchar(20), date DATE DEFAULT CURRENT_DATE, time TIME DEFAULT CURRENT_TIME(0)
    )`);

    await client.end();
  } catch (err) {
    console.log(err);
  }
};

createDbEntries();
