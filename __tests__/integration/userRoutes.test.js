process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app")
const db = require('../../db');
const User = require('../../models/user');

let u1;

beforeEach(async function () {
  db.query('DELETE FROM users')

  u1 = new User({
    username: "testuser",
    password: "testpassword",
    first_name: "testfirst",
    last_name: "testlast",
    email: "test@email.net",
    photo_url: "testphoto",
  });

  await u1.addToDb();
});

describe("GET /users tests", () => {
  test("Get all users",
    async function () {
      const resp = await request(app).get(`/users`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.users.length).toEqual(1);
    }
  );
});

describe("GET /users/:username tests", () => {
  test("Get one user",
    async function () {
      const resp = await request(app)
        .get(`/users/testuser`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.user.username).toEqual("testuser");
    }
  );

  test("Get one user - fails if user doesn't exist",
    async function () {
      const resp = await request(app)
        .get(`/users/0`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body.message).toEqual('User not found!');
    }
  );
});

describe("POST /users tests", () => {
  test("Post - creates new user",
    async function () {
      const resp = await request(app)
        .post(`/users`)
        .send({
          username: "testuser2",
          password: "testpassword2",
          first_name: "testfirst2",
          last_name: "testlast2",
          email: "test2@email.net",
          photo_url: "testphoto2",
        });

      expect(resp.statusCode).toEqual(201);
      expect(resp.body.user.username).toEqual('testuser2');

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(2);
    }
  );

  test("Post - fails with invalid input types - refer to JSON schema",
    async function () {
      const resp = await request(app)
        .post(`/users`)
        .send({
          username: 0,
          password: "short",
          first_name: 0,
          last_name: 0,
          email: "invalid email",
          photo_url: 0,
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(6);

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(1);
    }
  );

  test("Post - fails with missing required inputs (uname, pw, f_name, l_name, email)",
    async function () {
      const resp = await request(app)
        .post(`/users`)
        .send({
          photo_url: "testphoto",
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(5);

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(1);
    }
  );

  test("Post - fails with extraneous inputs",
    async function () {
      const resp = await request(app)
        .post(`/users`)
        .send({
          username: "testuser2",
          password: "testpassword2",
          first_name: "testfirst2",
          last_name: "testlast2",
          email: "test2@email.net",
          photo_url: "testphoto2",
          extra: "not-allowed",
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(1);

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(1);
    }
  );
});

describe("PATCH /users/:username tests", () => {
  test("Patch - updates existing user",
    async function () {
      const resp = await request(app)
        .patch(`/users/testuser`)
        .send({ first_name: "new-first-name" });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({ user: expect.any(Object) });
      expect(resp.body.user.first_name).toEqual('new-first-name');

      const respGet = await request(app)
        .get(`/users/testuser`);

      expect(respGet.body.user.first_name).toEqual('new-first-name');
    }
  );

  test("Patch - fails with invalid input types - refer to JSON schema",
    async function () {
      const resp = await request(app)
        .patch(`/users/testuser`)
        .send({
          password: "short",
          first_name: 0,
          last_name: 0,
          email: "invalid email",
          photo_url: 0,
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(5);

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(1);
    }
  );

  test("Patch - fails with extraneous inputs",
    async function () {
      const resp = await request(app)
        .patch(`/users/testuser`)
        .send({
          password: "testpassword2",
          first_name: "testfirst2",
          last_name: "testlast2",
          email: "test2@email.net",
          photo_url: "testphoto2",
          extra: "not-allowed",
        });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body.message).toEqual(expect.any(Array));
      expect(resp.body.message.length).toEqual(1);

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(1);
    }
  );

  test("Patch - fails if username doesn't exist",
    async function () {
      const resp = await request(app)
        .patch(`/users/invalid`)
        .send({
          password: "testpassword2",
          first_name: "testfirst2",
          last_name: "testlast2",
          email: "test2@email.net",
          photo_url: "testphoto2",
        });

      expect(resp.statusCode).toEqual(404);
      expect(resp.body.message).toEqual('User does not exist');

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(1);
    }
  );
});
describe("DELETE /users/:username tests", () => {
  test("Delete - removes user",
    async function () {
      const resp = await request(app)
        .delete(`/users/testuser`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.message).toEqual("User successfully deleted");

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(0);
    }
  );

  test("Delete - fails if username doesn't exist",
    async function () {
      const resp = await request(app)
        .delete(`/users/invalid`);

      expect(resp.statusCode).toEqual(404);
      expect(resp.body.message).toEqual('User does not exist');

      const respGet = await request(app)
        .get(`/users`);

      expect(respGet.body.users.length).toEqual(1);
    }
  );
});

afterAll(async function () {
  await db.end();
});
