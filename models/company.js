const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const ExpressError = require('../helpers/expressError');

class Company {
  constructor({ handle, name, description, numEmployees, logoUrl }) {
    this.handle = handle;
    this.name = name;
    this.description = description;
    this.numEmployees = numEmployees;
    this.logoUrl = logoUrl;
  }

  static async all() {
    const results = await db.query(
      `SELECT 
        handle, 
        name, 
        description, 
        num_employees AS numEmployees, 
        logo_url AS logoUrl
      FROM companies
      ORDER BY name`
    );
    return results.rows.map(c => new Company(c));
  }

  static async getByHandle(handle) {
    try {
      const results = await db.query(
        `SELECT 
          handle, 
          name, 
          description, 
          num_employees AS numEmployees, 
          logo_url AS logoUrl
        FROM companies
        WHERE handle = $1`,
        [handle]
      );

      const company = results.rows[0];

      if (!company) {
        throw new ExpressError('Company not found!', 404);
      }

      return new Company(company);
    } catch (err) {
      return next(err);
    }
  }

  static async filterByQueries(queries) {
    try {
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
        [filterParams.values]
      );

      if (results.rows.length === 0) {
        throw new ExpressError('No companies exist with those parameters', 400);
      }

      let companies = results.rows.map(c => new Company(c));

      return { companies };
    } catch (err) {
      return next(err);
    }
  }




}