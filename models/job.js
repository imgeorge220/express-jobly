const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const ExpressError = require('../helpers/expressError');
const { buildJobFilter } = require("../helpers/buildFilterQuery")


class Job {
  constructor({ title, salary, equity, company_handle }) {
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
  }

  static async allByQueries(queries) {
    let filterParams = buildJobFilter(queries);

    const results = await db.query(
      filterParams.sqlQueryString,
      filterParams.values
    );

    if (results.rows.length === 0) {
      throw new ExpressError('No jobs found', 404);
    }

    let jobs = results.rows;

    return { jobs };
  }

  static async getByID(id) {
    const results = await db.query(
      `SELECT
          id,
          title,
          salary,
          equity,
          company_handle,
          date_posted
        FROM jobs
        WHERE id = $1`,
      [id]
    );

    const job = results.rows[0];

    if (!job) {
      throw new ExpressError('Job not found!', 404);
    }

    return { job };
  }


  static async update(id, items) {
    let queryParams = sqlForPartialUpdate("jobs", items, "id", id);

    const update = await db.query(
      queryParams.query,
      queryParams.values
    );

    if (update.rows.length === 0) {
      throw new ExpressError('Job does not exist', 404);
    }

    let job = update.rows[0];

    return { job };
  }

  async addToDb() {
    const job = (await db.query(
      `INSERT INTO jobs
          (title,
          salary,
          equity,
          company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          title,
          salary,
          equity,
          company_handle,
          date_posted`,
      [this.title,
      this.salary,
      this.equity,
      this.company_handle]
    )).rows[0];

    this.id = job.id;
    this.date_posted = job.date_posted;
  }

  static async deleteFromDb(id) {
    const deleted = await db.query(
      `DELETE FROM jobs
        WHERE id = $1`,
      [id]
    );

    if (deleted.rowCount === 0) {
      throw new ExpressError('Job does not exist', 404);
    }

    return { message: "Job successfully deleted" };
  }

}

module.exports = Job;