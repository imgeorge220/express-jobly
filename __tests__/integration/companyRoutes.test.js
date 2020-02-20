process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app")
const db = require('../../db');
const Company = require('../../models/company');

describe("Company Routes Tests", () => {

  let c1, c2;

  beforeEach(async function () {
    db.query('DELETE FROM companies')

    c1 = new Company({
      handle: "test1",
      name: "Test1",
      description: "is a test",
      num_employees: 5,
      logo_url: "www.test.gov"
    });

    c2 = new Company({
      handle: "test2",
      name: "Test2",
      description: "is a test2",
      num_employees: 60,
      logo_url: "www.test2.gov"
    });

    c1.addToDb();
    c2.addToDb();
  });

  test("Get all- no filter",
    async function () {
      const resp = await request(app).get(`/companies`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        companies: [
          expect.any(Object),
          expect.any(Object)
        ]
      });
    }
  );

  test("Get- search by name",
    async function () {
      const resp = await request(app).get(`/companies?search=test1`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        companies: [expect.any(Object)]
      });
    }
  );

  test("Get- search by name - fails if no match",
    async function () {
      const resp = await request(app).get(`/companies?search=test3`);

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual('No companies exist with those parameters');
    }
  );

  test("Get- filter by max_employee",
    async function () {
      const resp = await request(app).get(`/companies?maxEmployees=30`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        companies: [expect.any(Object)]
      });
    }
  );

  test("Get- filter by max_employee - fails if no match",
    async function () {
      const resp = await request(app).get(`/companies?maxEmployees=4`);

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual('No companies exist with those parameters');
    }
  );

  test("Get- filter by min_employee",
    async function () {
      const resp = await request(app).get(`/companies?minEmployees=30`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        companies: [expect.any(Object)]
      });
    }
  );

  test("Get- filter by min_employee - fails if no match",
    async function () {
      const resp = await request(app).get(`/companies?minEmployees=100`);

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual('No companies exist with those parameters');
    }
  );

  test("Get- filter by employees range - fails if max < min",
    async function () {
      const resp = await request(app).get(`/companies?minEmployees=100&maxEmployees=10`);

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual("Max value cannot be lower than min value");
    }
  );

  test("Get- filter by all possible params",
    async function () {
      const resp = await request(app)
        .get(`/companies?minEmployees=3&maxEmployees=65&search=test`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        companies: [
          expect.any(Object),
          expect.any(Object)
        ]
      });
    }
  );

  test("Get one company",
    async function () {
      const resp = await request(app)
        .get(`/companies/test1`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({ company: expect.any(Object) });
    }
  );

  test("Get one company - fails if handle doesn't exist",
    async function () {
      const resp = await request(app)
        .get(`/companies/test3`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body.message).toEqual('Company not found!');
    }
  );

  test("Post - creates new company",
    async function () {
      const resp = await request(app)
        .post(`/companies`)
        .send({
          handle: "test3",
          name: "Test3",
          description: "is a test3",
          num_employees: 5,
          logo_url: "www.test.gov"
        });

      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({ company: expect.any(Object) });

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(3);
    }
  );

  test("Post - fails with invalid input types - refer to JSON schema",
    async function () {
      const resp = await request(app)
        .post(`/companies`)
        .send({
          handle: 1,
          name: 1,
          description: 1,
          num_employees: "five",
          logo_url: 1
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(5);

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(2);
    }
  );

  test("Post - fails with missing required inputs (handle & name)",
    async function () {
      const resp = await request(app)
        .post(`/companies`)
        .send({
          description: "test",
          num_employees: 20,
          logo_url: "test"
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(2);

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(2);
    }
  );

  test("Patch - updates existing company",
    async function () {
      const resp = await request(app)
        .patch(`/companies/test1`)
        .send({ description: "updated-description" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({ company: expect.any(Object) });
      expect(resp.body.company.description).toEqual("updated-description");

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(2);
    }
  );

  test("Patch - fails with invalid input types - refer to JSON schema",
    async function () {
      const resp = await request(app)
        .patch(`/companies/test1`)
        .send({
          description: 0,
          num_employees: "five",
          logo_url: 0
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(3);

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(2);
    }
  );

  test("Patch - fails company handle doesn't exist",
    async function () {
      const resp = await request(app)
        .patch(`/companies/test3`)
        .send({
          description: "test",
          num_employees: 5,
          logo_url: "test"
        });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body.message).toEqual('Company does not exist');

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(2);
    }
  );

  test("Delete - removes company",
    async function () {
      const resp = await request(app)
        .delete(`/companies/test1`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.message).toEqual("Company successfully deleted");

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(1);
    }
  );

  test("Delete - fails if company handle doesn't exist",
    async function () {
      const resp = await request(app)
        .delete(`/companies/test3`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body.message).toEqual('Company does not exist');

      const respGet = await request(app)
        .get(`/companies`);

      expect(respGet.body.companies.length).toEqual(2);
    }
  );
});

afterAll(async function () {
  await db.end();
});
