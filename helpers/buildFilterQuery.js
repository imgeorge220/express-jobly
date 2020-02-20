/**
 * Expects an object of query parameters with possible keys of 
 * 'search', 'minEmployees', 'maxEmployees'.
 * 
 * Returns an object:
 *  -query: SQL query string of filters
 *  -value: array of sanitized values for query
 */

function buildFilter(queries) {
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

    let searchQuery = `num_employees > $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  if (queries.maxEmployees) {
    values.push(+queries.maxEmployees);

    let searchQuery = `num_employees < $${index}`;
    queryArr.push(searchQuery);

    index++;
  }

  let sqlQuery = queryArr.join(' AND ');

  if (sqlQuery.length !== 0){
    sqlQuery = `WHERE ${sqlQuery}`
  }

  return { sqlQuery, values };
}

module.exports = buildFilter;