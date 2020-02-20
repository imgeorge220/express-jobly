const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const ExpressError = require('../helpers/expressError');
const { buildCompanyFilter } = require("../helpers/buildFilterQuery")


class Company {
  constructor({ handle, name, description, num_employees, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.description = description;
    this.numEmployees = num_employees;
    this.logoUrl = logo_url;
  }

  static async allByQueries(queries) {
    if (queries.minEmployees > queries.maxEmployees) {
      throw new ExpressError("Max value cannot be lower than min value", 400);
    }
    let filterParams = buildCompanyFilter(queries);

    const results = await db.query(
      filterParams.sqlQueryString,
      filterParams.values
    );

    if (results.rows.length === 0) {
      throw new ExpressError('No companies found', 404);
    }

    let companies = results.rows;

    return { companies };
  }

  static async getByHandle(handle) {
    const results = await db.query(
      `SELECT
          handle,
          name,
          description,
          num_employees,
          logo_url,
          j.id,
          j.title,
          j.salary,
          j.equity,
          j.date_posted
        FROM companies
        LEFT JOIN jobs j
        ON handle = j.company_handle
        WHERE handle = $1`,
      [handle]
    );

    const company = results.rows[0];
    const jobs = results.rows;

    if (!company) {
      throw new ExpressError('Company not found!', 404);
    }

    return {
      company: {
        handle: company.handle,
        name: company.name,
        description: company.description,
        num_employees: company.num_employees,
        logo_url: company.logo_url,
        jobs: jobs.map(r => ({
          id: r.id,
          title: r.title,
          salary: r.salary,
          equity: r.equity,
          date_posted: r.date_posted
        }))
      }
    };
  }


  static async update(handle, items) {
    let queryParams = sqlForPartialUpdate("companies", items, "handle", handle);

    const update = await db.query(
      queryParams.query,
      queryParams.values
    );

    if (update.rows.length === 0) {
      throw new ExpressError('Company does not exist', 404);
    }

    let company = update.rows[0];

    return { company };
  }

  async addToDb() {
    await db.query(
      `INSERT INTO companies
          (handle,
          name,
          description,
          num_employees,
          logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          handle,
          name,
          description,
          num_employees AS "numEmployees",
          logo_url AS "logoUrl"`,
      [this.handle,
      this.name,
      this.description,
      this.numEmployees,
      this.logoUrl]
    );
  }

  static async deleteFromDb(handle) {
    const deleted = await db.query(
      `DELETE FROM companies
        WHERE handle = $1`,
      [handle]
    );

    if (deleted.rowCount === 0) {
      throw new ExpressError('Company does not exist', 404);
    }

    return { message: "Company successfully deleted" };
  }

}

module.exports = Company;