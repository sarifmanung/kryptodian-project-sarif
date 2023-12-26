const nodemailer = require("nodemailer");
const axios = require("axios");
const bcrypt = require("bcrypt");
fs = require("fs");
path = require("path");

// Number of salt rounds to use
const saltRounds = 10;

// Function to hash a password
exports.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

// Function to compare a plaintext password with a hash
exports.comparePassword = async function (plaintextPassword, hash) {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
};
