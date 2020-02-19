const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const ExpressError = require('../helpers/expressError');
const express = require("express");
const buildFilter = require("../helpers/buildFilterQuery")


class Company {
  constructor({ handle, name, description, num_employees, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.description = description;
    this.numEmployees = num_employees;
    this.logoUrl = logo_url;
  }

  static async all() {
    const results = await db.query(
      `SELECT
        handle,
        name
      FROM companies
      ORDER BY name`
    );

    let companies = results.rows.map(c => new Company(c))
    return { companies };
  }

  static async getByHandle(handle) {
    const results = await db.query(
      `SELECT
          handle,
          name,
          description,
          num_employees,
          logo_url
        FROM companies
        WHERE handle = $1`,
      [handle]
    );

    const company = results.rows[0];

    if (!company) {
      throw new ExpressError('Company not found!', 404);
    }

    return {company: new Company(company)};
  }

  static async filterByQueries(queries) {
    if (queries.minEmployees > queries.maxEmployees) {
      throw new ExpressError("Max value cannot be lower than min value", 400);
    }
    let filterParams = buildFilter(queries);
    const results = await db.query(
      `SELECT
      handle,
      name
      FROM companies
      WHERE ${filterParams.sqlQuery}`,
      filterParams.values
      );

    if (results.rows.length === 0) {
      throw new ExpressError('No companies exist with those parameters', 400);
    }

    let companies = results.rows.map(c => new Company(c));

    return { companies };
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

      let company = new Company(update.rows[0]);

    return { company };
  }

  async addToDb() {
    const company = (await db.query(
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
    )).rows[0];

    return { company };

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