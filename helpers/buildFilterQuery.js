/**
 * Expects an object of query parameters with possible keys of
 * 'search', 'minEmployees', 'maxEmployees'.
 *
 * Returns an object:
 *  -query: SQL query string of filters
 *  -value: array of sanitized values for query
 */

function buildCompanyFilter(queries) {
  let queryArr = [];
  let values = [];
  let index = 1;

  if (queries.search) {
    let searchTerm = queries.search.split('+').join(' ');
    values.push(`%${searchTerm}%`);

    let searchQuery = `name ILIKE $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  if (queries.minEmployees) {
    values.push(+queries.minEmployees);

    let searchQuery = `num_employees >= $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  if (queries.maxEmployees) {
    values.push(+queries.maxEmployees);

    let searchQuery = `num_employees <= $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  let whereStatement = queryArr.join(' AND ');

  if (whereStatement.length !== 0){
    whereStatement = `WHERE ${whereStatement}`
  }

  let sqlQueryString = `
  SELECT
  handle,
  name
  FROM companies
  ${whereStatement}
  `

  return { sqlQueryString, values };
}


/**
 * Expects an object of query parameters with possible keys of
 * 'search', 'minSalary', 'minEquity'.
 *
 * Returns an object:
 *  -query: SQL query string of filters
 *  -value: array of sanitized values for query
 */
function buildJobFilter(queries) {
  let queryArr = [];
  let values = [];
  let index = 1;

  if (queries.search) {
    let searchTerm = queries.search.split('+').join(' ');
    values.push(`%${searchTerm}%`);

    let searchQuery = `title ILIKE $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  if (queries.minSalary) {
    values.push(+queries.minSalary);

    let searchQuery = `salary >= $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  if (queries.minEquity) {
    values.push(+queries.minEquity);

    let searchQuery = `equity >= $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  let whereStatement = queryArr.join(' AND ');

  if (whereStatement.length !== 0){
    whereStatement = `WHERE ${whereStatement}`;
  }

  let sqlQueryString = `SELECT
  title,
  company_handle
  FROM jobs
  ${whereStatement}
  ORDER BY date_posted DESC`

  return { sqlQueryString, values };
}

module.exports = { buildJobFilter, buildCompanyFilter };