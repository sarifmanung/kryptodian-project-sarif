var express = require("express");
var app = express.Router();
let { hashPassword, comparePassword } = require("./utils.js");
const axios = require("axios");
let useragent = require("express-useragent");
var session = require("express-session");
var mysql = require("mysql");

require("dotenv").config();

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

// post create new user
app.post("/createUser", async (req, res) => {
  const { username, email, phone, password } = req.body;

  // hash password
  const hash_password = await hashPassword(password);

  // Check if the username already exists
  const checkUsernameQuery = "SELECT * FROM Users WHERE username = ?";
  pool.query(
    checkUsernameQuery,
    [username],
    async function (err, usernameResults) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "MySql error!" });
      }

      // If username already exists, return an error response
      if (usernameResults.length > 0) {
        console.log("Username already exists");
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if the email already exists
      const checkEmailQuery = "SELECT * FROM Users WHERE email = ?";
      pool.query(checkEmailQuery, [email], async function (err, emailResults) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "MySql error!" });
        }

        // If email already exists, return an error response
        if (emailResults.length > 0) {
          console.log("Email already exists");
          return res.status(400).json({ error: "Email already exists" });
        }

        // If username and email don't exist, proceed to insert the new user
        const insertUserQuery =
          "INSERT INTO Users (username, email, phone, password) VALUES (?, ?, ?, ?)";
        const insertData = [username, email, phone, hash_password];
        pool.query(
          insertUserQuery,
          insertData,
          async function (err, endresult) {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "MySql error!" });
            }
            req.session.mysqlid = endresult.insertId;
            // send a success response
            res.json({ message: "User created successfully" });
          }
        );
      });
    }
  );
});

// /auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email exists in the database
    const userQuery = "SELECT * FROM Users WHERE email = ?";
    pool.query(userQuery, [email], async function (err, results) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "MySql error!" });
      }

      // If the email does not exist, return an error response
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if the password is correct
      const storedPassword = results[0].password;

      // Use a dedicated function to compare passwords
      const passwordMatch = await comparePassword(password, storedPassword);

      if (!passwordMatch) {
        // Use a generic error message to avoid revealing too much information
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.email = email;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
        } else {
          console.log("Session saved successfully");
        }
      });

      console.log("email is ", req.session.email);
      res.send("ok");
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/userPortfolio", async (req, res) => {
  const { email } = req.session;

  console.log(req.session.email);
  console.log(email);
  res.json({ message: "ok" });
});

module.exports = app;
