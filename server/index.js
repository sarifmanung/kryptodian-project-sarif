var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var morgan = require("morgan");
var cors = require("cors");
var session = require("express-session");
require("dotenv").config();
const axios = require("axios");
let { fbconversionapitoken, fbpixel } = process.env;
var geoip = require("geoip-country");
var sha256 = require("sha256");
var fs = require("fs");
require("log-timestamp");

app.use(
  session({
    secret: "dcggdeee",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.use("/assets", express.static(__dirname + "/assets"));

app.use(cors({ credentials: true, origin: true }));
app.enable("trust proxy", 1);
app.use(
  morgan("common", {
    stream: fs.createWriteStream("./access.log", { flags: "a" }),
  })
);
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
app.use(bodyParser.json({ limit: "20mb", extended: true }));

var v1 = require("./routes/v1.js");
app.use("/v1", v1);

app.use("*", async (req, res, next) => {
  // fb pixel pageview event

  timestamp = Math.floor(+new Date() / 1000);
  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();
  useragent = req.headers["user-agent"];

  userdata = {
    client_ip_address: ip,
    client_user_agent: useragent,
  };

  var geo = geoip.lookup(ip);
  if (geo && geo.country) {
    userdata["country"] = [sha256(geo.country.toLowerCase())];
    req.session.fromcountry = geo.country;
    res.cookie("fromcountry", geo.country);
  }

  next();
});

var html = require("./routes/html.js");
app.use("/", html);

let port = 5001;
var server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
server.setTimeout(60000);
