const bcrypt = require('bcrypt');

const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const ExpressError = require('../helpers/expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');


class User {
  constructor({ username, password, first_name, last_name, email, photo_url }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
  }

  static async all() {

    const results = await db.query(
      `SELECT
        username,
        first_name,
        last_name,
        email
        FROM users`
    );

    let users = results.rows;

    return { users };
  }

  static async getByUsername(username) {
    const results = await db.query(
      `SELECT
        username,
        first_name,
        last_name,
        email,
        photo_url 
        FROM users
        WHERE username = $1`,
      [username]
    );

    const user = results.rows[0];

    if (!user) {
      throw new ExpressError('User not found!', 404);
    }

    return { user }
  }

  static async update(username, items) {

    if (items.password) {
      items.password = await bcrypt.hash(items.password, BCRYPT_WORK_FACTOR);
    }

    let queryParams = sqlForPartialUpdate("users", items, "username", username);

    const update = await db.query(
      queryParams.query,
      queryParams.values
    );

    if (update.rows.length === 0) {
      throw new ExpressError('User does not exist', 404);
    }

    let user = update.rows[0];

    return {
      user: {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo_url: user.photo_url
      }
    };
  }

  async addToDb() {
    const hashedPassword = await bcrypt.hash(this.password, BCRYPT_WORK_FACTOR);

    await db.query(
      `INSERT INTO users
        (username,
        password,
        first_name,
        last_name,
        email,
        photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        username,
        first_name,
        last_name,
        email,
        photo_url`,
      [this.username,
        hashedPassword,
      this.first_name,
      this.last_name,
      this.email,
      this.photo_url]
    );

    delete this.password;
  }

  static async deleteFromDb(username) {
    const deleted = await db.query(
      `DELETE FROM users
        WHERE username = $1`,
      [username]
    );

    if (deleted.rowCount === 0) {
      throw new ExpressError('User does not exist', 404);
    }

    return { message: "User successfully deleted" };
  }

}

module.exports = User;