import request from "supertest";
import app from "../src";
import { User } from "../src/app/models";
import { dbClose, dbConnect } from "./config/db.conn";

const agent = request.agent(app);
let auth_token;
beforeAll(async () => {
  await dbConnect();
  const user = await User.create({
    first_name: "Rusiru",
    last_name: "Bandara",
    password: "Rusiru#@1998",
    user_name: "cyb44",
    phone_number: "0776621325",
    email: "rusiru@gmail.com",
    role: "admin",
  });
  auth_token = await user.generateAuthToken();
});

afterAll(async () => await dbClose());

describe("unauthorized create user account", () => {
  describe("POST /user", () => {
    test("failed", async () => {
      const res = await agent.post("/user").send({
        first_name: "Rusiru",
        last_name: "Bandara",
        password: "Rusiru#@1998",
        user_name: "cyb45",
        phone_number: "0776621325",
        email: "rusiru@gmail.com",
        role: "worker",
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.dev_message).toEqual("token_not_found");
      expect(res.body).toBeTruthy();
    });
  });
});

describe("authorized create user account", () => {
  describe("POST /user", () => {
    test("passed", async () => {
      const res = await agent
        .post("/user")
        .send({
          first_name: "Rusiru",
          last_name: "Bandara",
          password: "Rusiru#@1998",
          user_name: "cyb46",
          phone_number: "0776621325",
          email: "rusiru@gmail.com",
          role: "worker",
        })
        .set({
          Authorization: auth_token,
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.dev_message).toEqual("acount_created");
      expect(res.body).toBeTruthy();
    });
  });
});

describe("create already exists user account", () => {
  describe("POST /user", () => {
    test("failed", async () => {
      const res = await agent
        .post("/user")
        .send({
          first_name: "Rusiru",
          last_name: "Bandara",
          password: "Rusiru#@1998",
          user_name: "cyb46",
          phone_number: "0776621325",
          email: "rusiru@gmail.com",
          role: "worker",
        })
        .set({
          Authorization: auth_token,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.dev_message).toEqual("user_name_already_exits");
      expect(res.body).toBeTruthy();
    });
  });
});

describe("successful message create", () => {
  describe("POST /message", () => {
    test("passed", async () => {
      const res = await agent
        .post("/message")
        .send({
          message: "This is test message",
        })
        .set({
          Authorization: auth_token,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeTruthy();
    });
  });
});

describe("suspicious sql injection message create", () => {
  describe("POST /message", () => {
    test("failed", async () => {
      const res = await agent
        .post("/message")
        .send({
          message: "select * from users",
        })
        .set({
          Authorization: auth_token,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeTruthy();
    });
  });
});

describe("javascript message create", () => {
  describe("POST /message", () => {
    test("failed", async () => {
      const res = await agent
        .post("/message")
        .send({
          message: "<script>let users = []</script>",
        })
        .set({
          Authorization: auth_token,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeTruthy();
    });
  });
});
