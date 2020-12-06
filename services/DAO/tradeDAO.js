const db = require("../../client/db");

const dbClient = require("../../client/db").client;

class tradeDAO {
  async getOrders(userId) {
    let orders = await dbClient.query(
      `SELECT * FROM orders WHERE user_id = ${userId} ORDER BY id`
    );

    return orders.rows;
  }

  async createNewOrder(
    userId,
    type,
    instrument,
    quantity,
    price,
    status,
    time
  ) {
    await dbClient.query(
      `INSERT INTO orders(user_id, type, instrument, quantity, price, status, time) VALUES(${userId}, '${type}', '${instrument}', ${quantity}, ${price}, '${status}', '${time}')`
    );
  }

  async cancelOrder(orderId, status) {
    let order = await dbClient.query(
      `SELECT status from orders where id=${orderId}`
    );
    order = order.rows[0];
    if (order.status == "OPEN") {
      await dbClient.query(
        `UPDATE orders SET status = 'CANCELED' WHERE id=${orderId}`
      );
    }
  }

  async getUserOrder(orderId) {
    let order = await dbClient.query(
      `SELECT * FROM orders WHERE id=${orderId}`
    );
    return order.rows[0];
  }

  async updateUserOrder(id, type, quantity, price, time) {
    await dbClient.query(
      `UPDATE orders SET type='${type}', quantity=${quantity}, price=${price}, time='${time}' WHERE id=${id}`
    );
  }
}

module.exports = new tradeDAO();
