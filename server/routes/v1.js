var express = require("express");
var app = express.Router();
let { hashPassword, comparePassword } = require("./utils.js");
const axios = require("axios");
var mysql = require("mysql");

require("dotenv").config();
let { fbconversionapitoken, fbpixel } = process.env;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

var pool = mysql.createPool({
  connectionLimit: 20,
  host: "localhost",
  user: "root",
  password: "password",
  database: "kryptodian_app",
  multipleStatements: true,
  charset: "utf8mb4",
});

app.get("/", (req, res) => {
  console.log(`All Connections ${pool._allConnections.length}`);
  pool.getConnection(function (err, connection) {
    console.log(`All Connections ${pool._allConnections.length}`);
    console.log(`Acquiring Connections ${pool._acquiringConnections.length}`);
    console.log(`Free Connections ${pool._freeConnections.length}`);
    console.log(`Queue Connections ${pool._connectionQueue.length}`);
    console.log(`connecting to db with id: ${connection.threadId}`);

    connection.release();
  });

  res.send("api la");
});

app.get("/data", (req, res) => {
  res.json({ message: "Hello from the backend! 333" });
});

// post form (react)
app.post("/register", async (req, res) => {
  let { username, email, phone, password } = req.body;

  // hash password
  let hash_password = await hashPassword(password);

  // Check if the username already exists
  const checkUsernameQuery = "SELECT * FROM Users WHERE username = ?";
  pool.query(checkUsernameQuery, [username], async function (err, results) {
    if (err) {
      console.error(err);
      return res.status(404).send("MySql error!");
    }

    // If username already exists, return an error response
    if (results.length > 0) {
      return res.status(400).send("Username already exists");
    }

    // If username doesn't exist, proceed to insert the new user
    const insertUserQuery =
      "INSERT INTO Users (username, email, phone, password) VALUES (?, ?, ?, ?)";
    const insertData = [username, email, phone, hash_password];
    pool.query(insertUserQuery, insertData, async function (err, endresult) {
      if (err) {
        console.error(err);
        return res.status(404).send("MySql error!");
      }
      req.session.mysqlid = endresult.insertId;
      // send fast response and let everything do slowly
      res.send("ok");
    });
  });
});

module.exports = app;
