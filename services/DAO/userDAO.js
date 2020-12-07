const { client } = require("../../client/db");

const dbClient = require("../../client/db").client;

/**
 * This class handles all the db related logic for all the user
 */
class UserDAO {
  /**
   * This method fetches user holdings
   * @param {integer} userId - user id
   */
  async getUserHoldings(userId) {
    const userHoldings = await dbClient.query(
      `SELECT * FROM portfolio WHERE user_id = ${userId}`
    );

    return userHoldings.rows;
  }

  /**
   * This methods fetches all the instrument added by the user
   * @param {int} userId - user id
   */
  async getUserInstruments(userId) {
    const userInstruments = await dbClient.query(
      `SELECT * FROM instruments WHERE user_id = ${userId}`
    );

    return userInstruments.rows;
  }

  /**
   *
   * @param {int} userId - user id
   * @param {string} name - name of the instrument
   * @param {float} ltp - last traded price of the instrument
   */
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

  /**
   * This methods removes instrument by the user
   * @param {int} userId - user id
   * @param {string} name - instrument name
   */
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

  /**
   * This methods fetches user funds
   * @param {int} userId - user id
   */
  async getUserFunds(userId) {
    let funds = await dbClient.query(
      `SELECT * FROM funds WHERE user_id=${userId}`
    );
    return funds.rows[0].amount;
  }

  /**
   * This methods updates user's funds
   * @param {int} userId - user id
   * @param {float} funds - user funds
   */
  async updateUserFunds(userId, funds) {
    await dbClient.query(
      `UPDATE funds SET amount=${funds} WHERE user_id=${userId}`
    );
  }
  /**
   * This method fetches holding details of a paticular holding
   * @param {int} userId
   * @param {string} instrument
   */
  async getUserHoldingDetails(userId, instrument) {
    let holdingDetails = await dbClient.query(
      `SELECT * FROM portfolio WHERE user_id=${userId} AND instrument='${instrument}'`
    );
    return holdingDetails.rows;
  }
}

module.exports = new UserDAO();
