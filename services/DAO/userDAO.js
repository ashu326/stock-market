const { client } = require("../../client/db");

const dbClient = require("../../client/db").client;

class UserDAO {
  async getUserHoldings(userId) {
    const userHoldings = await dbClient.query(
      `SELECT * FROM portfolio WHERE user_id = ${userId}`
    );

    return userHoldings.rows;
  }

  async getUserInstruments(userId) {
    const userInstruments = await dbClient.query(
      `SELECT * FROM instruments WHERE user_id = ${userId}`
    );

    return userInstruments.rows;
  }

  async addUserInstrument(userId, name, ltp) {
    name = name.toUpperCase();
    let instrument = await dbClient.query(
      `SELECT * FROM instruments WHERE name='${name}' AND user_id=${userId}`
    );

    if (instrument.rows.length == 0) {
      await dbClient.query(
        `INSERT INTO instruments VALUES(${userId}, '${name}', ${ltp})`
      );
    }
  }

  async removeInstrument(userId, name) {
    let instrument = await dbClient.query(
      `SELECT * FROM instruments WHERE user_id=${userId} AND name='${name}'`
    );
    if (instrument.rows.length != 0) {
      await dbClient.query(
        `DELETE FROM instruments WHERE name='${name}' AND user_id=${userId}`
      );
    }
  }

  async getUserFunds(userId) {
    let funds = await dbClient.query(
      `SELECT * FROM funds WHERE user_id=${userId}`
    );
    return funds.rows[0].amount;
  }

  async updateUserFunds(userId, funds) {
    await dbClient.query(
      `UPDATE funds SET amount=${funds} WHERE user_id=${userId}`
    );
  }

  async getUserHoldingDetails(userId, instrument) {
    let holdingDetails = await dbClient.query(
      `SELECT * FROM portfolio WHERE user_id=${userId} AND instrument='${instrument}'`
    );
    return holdingDetails.rows;
  }
}

module.exports = new UserDAO();
