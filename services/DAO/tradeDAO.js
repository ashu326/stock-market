const db = require("../../client/db");

const dbClient = require("../../client/db").client;

/**
 * This class handles all the db related logic for all the trades
 */
class tradeDAO {
  async getOrders(userId) {
    let orders = await dbClient.query(
      `SELECT * FROM orders WHERE user_id = ${userId} AND date = CURRENT_DATE ORDER BY time`
    );

    return orders.rows;
  }

  /**
   *
   * @param {int} userId - user id of the user
   * @param {string} type - order status type
   * @param {string} instrument - instrument name
   * @param {int} quantity - instrument quantity
   * @param {float} price - instrument price(LTP)
   * @param {string} status - placed order status
   */
  async createNewOrder(userId, type, instrument, quantity, price, status) {
    await dbClient.query(
      `INSERT INTO orders(user_id, type, instrument, quantity, price, status) VALUES(${userId}, '${type}', '${instrument}', ${quantity}, ${price}, '${status}')`
    );
  }

  /**
   * This method cancels the open order which was placed by the user
   * @param {int} orderId - order id
   * @param {string} status - order status
   */
  async cancelOrder(orderId, status) {
    let order = await dbClient.query(
      `SELECT status from orders where id=${orderId}`
    );
    order = order.rows[0];
    if (order.status == "OPEN") {
      await dbClient.query(
        `UPDATE orders SET status = 'CANCELED', time = CURRENT_TIME(0) WHERE id=${orderId}`
      );
    }
  }
  /**
   * This method fetches all the orders placed by the user on the day
   * @param {int} orderId - order id
   */
  async getUserOrder(orderId) {
    let order = await dbClient.query(
      `SELECT * FROM orders WHERE id=${orderId}`
    );
    return order.rows[0];
  }

  /**
   * This method modifies the the placed order by the user
   * @param {int} id - order id
   * @param {string} type - order type(BUY or SELL)
   * @param {int} quantity - instrument quantity
   * @param {float} price - instrument last traded price
   */
  async updateUserOrder(id, type, quantity, price) {
    await dbClient.query(
      `UPDATE orders SET type='${type}', quantity=${quantity}, price=${price}, time = CURRENT_TIME(0) WHERE id=${id}`
    );
  }
}

module.exports = new tradeDAO();
