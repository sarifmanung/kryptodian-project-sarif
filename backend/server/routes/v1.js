var express = require("express");
var app = express.Router();
let {
  sendmail,
  formatdate,
  sendmail_resume_application,
  dcerror,
  leads_save,
  checkStr,
} = require("./utils.js");
require("dotenv").config();
let { fbconversionapitoken, fbpixel } = process.env;
const axios = require("axios");
let useragent = require("express-useragent");
var mysql = require("mysql");
var AWS = require("aws-sdk");
var multer = require("multer");
var multerS3 = require("multer-s3");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

var pool = mysql.createPool({
  connectionLimit: 20,
  host: "localhost",
  user: "root",
  password: "password",
  database: "dcaweb_de",
  multipleStatements: true,
  charset: "utf8mb4",
});

var s3 = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  region: "ap-southeast-1",
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

app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// test delaying
app.get("/api/data2", (req, res) => {
  // Introduce a 1-second delay before responding
  setTimeout(() => {
    res.json({ message: "Hello from the backend! ( Delaying for a sec~)" });
  }, 1000); // 1000 milliseconds = 1 second
});

// post form (react)
app.post("/api/submit", (req, res) => {
  let { fullName, email, phone } = req.body;
  console.log(
    "this data from the react =>",
    fullName,
    "\n",
    email,
    "\n",
    phone
  );
});

app.post("/assessment2", async (req, res) => {
  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();

  let {
    reason,
    teethtype,
    name1,
    name2,
    email,
    phone,
    message,
    cb_mail,
    lang,
  } = req.body;

  let { assessmentlang, assessmentsource } = req.session;

  let leedsheetname;
  if (assessmentsource == "google") leedsheetname = "google";
  else if (assessmentsource == "facebook") leedsheetname = "facebook";
  else if (assessmentsource == "tiktok") leedsheetname = "tiktok";
  else leedsheetname = "organic";

  let LeadsData = { TabName: leedsheetname, ...req.body };

  // save to leads.log
  leads_save("/assessment2", LeadsData);

  reason = JSON.stringify(reason);

  timestamp = Math.floor(+new Date() / 1000);
  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();
  useragent = req.headers["user-agent"];
  country = "de";
  sessionid = req.session.id;
  sql = "";

  if (!name1 || !name2 || !phone || !email) {
    return res.status(400).send("Missing Data");
  }

  // remove '=+' in front of the str
  name1 = checkStr(name1);
  name2 = checkStr(name2);
  phone = checkStr(phone);
  email = checkStr(email);
  message = checkStr(message);

  // add to google sheet
  if (cb_mail == "true") {
    try {
      doc_mail = new GoogleSpreadsheet(
        "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
      );

      await doc_mail.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      });

      await doc_mail.loadInfo(); // loads document properties and worksheets
      const sheet = doc_mail.sheetsByTitle["accept"];

      const addrowlo = await sheet.addRow({
        date: formatdate(),
        firstname: name1,
        lastname: name2,
        email,
        phone,
      });
    } catch (err) {
      console.error(err);
      dcerror(
        "/assessment2 api, customerName: " +
          name1 +
          " " +
          name2 +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "google accept sheet err -> " +
          err
      );
    }
  }

  //3. save to db
  sql = `insert into preassessment (reason, teethtype, firstname, lastname, email, phone, message, ip, country) values (?)`;
  insertData = [
    reason,
    teethtype,
    name1,
    name2,
    email,
    phone,
    message,
    ip,
    country,
  ];
  pool.query(sql, [insertData], async function (err, endresult) {
    if (err) {
      console.error(err);
      if (err.sqlMessage)
        dcerror(
          "/assessment2 api, customerName: " +
            name1 +
            " " +
            name2 +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "mysql error -> " +
            err.sqlMessage
        );
      else
        dcerror(
          "/assessment2 api, customerName: " +
            name1 +
            " " +
            name2 +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "mysql error -> " +
            err
        );
      return res.status(404).send("MySql error!");
    }
    req.session.mysqlid = endresult.insertId;

    // send fast response and let everything do slowly
    res.send("ok");
  });

  // add to new german sheet
  try {
    doc = new GoogleSpreadsheet("1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw");

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle[leedsheetname];
    const larryRow = await sheet.addRow({
      id: req.session.mysqlid,
      date: formatdate(),
      reason,
      teethtype,
      firstname: name1,
      lastname: name2,
      phone,
      email,
      message,
      language: lang,
    });
  } catch (err) {
    console.error(err);
    dcerror(
      "/assessment2 api, customerName: " +
        name1 +
        " " +
        name2 +
        ", phoneNumber: " +
        phone +
        " \nThe IP address is " +
        ip +
        "\n" +
        "google " +
        leedsheetname +
        " sheet err -> " +
        err
    );
  }

  req.session.leedsheetname = leedsheetname;
  req.session.name1 = name1;
  req.session.name2 = name2;
  req.session.email = email;
  req.session.phone = phone;
  req.session.message = message;
  req.session.cb_mail = cb_mail;
  req.session.teethtype = teethtype;
  req.session.reason = reason;
  req.session.save();
});

var upload_pre_assess = multer({
  storage: multerS3({
    s3: s3,
    bucket: "de-dca-pre-assessment",
    metadata: function (req, file, cb) {
      cb(null, {
        Fieldname: file.fieldname,
        Mimetype: file.mimetype,
      });
    },
    key: function (req, file, cb) {
      let file_name =
        new Date().getTime() + "-" + file.originalname.split(" ").join("_");

      cb(null, file_name);
    },
  }),
});

const cpUpload_pre_assess = upload_pre_assess.fields([
  { name: "frontteethclose", maxCount: 1 },
  { name: "frontteethopen", maxCount: 1 },
  { name: "leftside", maxCount: 1 },
  { name: "upperteeth", maxCount: 1 },
  { name: "lowerteeth", maxCount: 1 },
  { name: "rightside", maxCount: 1 },
]);

app.post("/assessment1_image", (req, res) => {
  let { name1, name2, phone, assessmentlang, assessmentsource, mysqlid } =
    req.session;

  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();

  let leedsheetname;
  if (assessmentsource == "google") leedsheetname = "google";
  else if (assessmentsource == "facebook") leedsheetname = "facebook";
  else if (assessmentsource == "tiktok") leedsheetname = "tiktok";
  else leedsheetname = "organic";

  if (!mysqlid || mysqlid <= 0)
    return res.status(400).json({
      message: "Error occured",
    });

  timestamp = Math.floor(+new Date() / 1000);
  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();
  useragent = req.headers["user-agent"];
  country = "de";

  // fb pixel
  /*
                                axios.post('https://graph.facebook.com/v13.0/' + fbpixel + '/events?access_token=' + fbconversionapitoken, {
                                        "data": [{
                                            "event_name": "assessment1_step4",
                                            "event_time": timestamp,
                                            "action_source": "website",
                                            "user_data": {
                                                "country": [
                                                    "038468518ad8122e13112743f890c7ba96ac5665b71de548eceb23e9ef237805" // my
                                                ],
                                                "client_ip_address": ip,
                                                "client_user_agent": useragent,
                                            },
                                        }]
                                    })
                                    .then(function(response) {
                                        //console.log(response);

                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                        console.log(error.response)
                                    })
                                    */

  // upload to s3 dca-pre-assessment
  cpUpload_pre_assess(req, res, async function (err) {
    let sql = ``;
    let discordImg = ``;

    if (req.files.frontteethclose) {
      sql +=
        `insert into preassessment_images (preassessmentid, fieldname, originalname, awskey, awslocation) values (` +
        mysqlid +
        `, 'frontteethclose', ` +
        pool.escape(req.files.frontteethclose[0].originalname) +
        `, ` +
        pool.escape(req.files.frontteethclose[0].key) +
        `, ` +
        pool.escape(req.files.frontteethclose[0].location) +
        `); \n`;
      discordImg += `\nfrontteethclose:<${req.files.frontteethclose[0].location}>`;
    }
    if (req.files.frontteethopen) {
      sql +=
        `insert into preassessment_images (preassessmentid, fieldname, originalname, awskey, awslocation) values (` +
        mysqlid +
        `, 'frontteethopen', ` +
        pool.escape(req.files.frontteethopen[0].originalname) +
        `, ` +
        pool.escape(req.files.frontteethopen[0].key) +
        `, ` +
        pool.escape(req.files.frontteethopen[0].location) +
        `); \n`;
      discordImg += `\nfrontteethopen:<${req.files.frontteethopen[0].location}>`;
    }
    if (req.files.leftside) {
      sql +=
        `insert into preassessment_images (preassessmentid, fieldname, originalname, awskey, awslocation) values (` +
        mysqlid +
        `, 'leftside', ` +
        pool.escape(req.files.leftside[0].originalname) +
        `, ` +
        pool.escape(req.files.leftside[0].key) +
        `, ` +
        pool.escape(req.files.leftside[0].location) +
        `); \n`;
      discordImg += `\nleftside:<${req.files.leftside[0].location}>`;
    }
    if (req.files.upperteeth) {
      sql +=
        `insert into preassessment_images (preassessmentid, fieldname, originalname, awskey, awslocation) values (` +
        mysqlid +
        `, 'upperteeth', ` +
        pool.escape(req.files.upperteeth[0].originalname) +
        `, ` +
        pool.escape(req.files.upperteeth[0].key) +
        `, ` +
        pool.escape(req.files.upperteeth[0].location) +
        `); \n`;
      discordImg += `\nupperteeth:<${req.files.upperteeth[0].location}>`;
    }
    if (req.files.lowerteeth) {
      sql +=
        `insert into preassessment_images (preassessmentid, fieldname, originalname, awskey, awslocation) values (` +
        mysqlid +
        `, 'lowerteeth', ` +
        pool.escape(req.files.lowerteeth[0].originalname) +
        `, ` +
        pool.escape(req.files.lowerteeth[0].key) +
        `, ` +
        pool.escape(req.files.lowerteeth[0].location) +
        `); \n`;
      discordImg += `\nlowerteeth:<${req.files.lowerteeth[0].location}>`;
    }
    if (req.files.rightside) {
      sql +=
        `insert into preassessment_images (preassessmentid, fieldname, originalname, awskey, awslocation) values (` +
        mysqlid +
        `, 'rightside', ` +
        pool.escape(req.files.rightside[0].originalname) +
        `, ` +
        pool.escape(req.files.rightside[0].key) +
        `, ` +
        pool.escape(req.files.rightside[0].location) +
        `); \n`;
      discordImg += `\nrightside:<${req.files.rightside[0].location}>`;
    }

    if (err instanceof multer.MulterError) {
      console.error(err);
      if (err.code)
        dcerror(
          "/assessment1_image api, customerName: " +
            name1 +
            " " +
            name2 +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "upload to s3 Upload unsuccessful ->" +
            err.code +
            discordImg
        );
      else
        dcerror(
          "/assessment1_image api, customerName: " +
            name1 +
            " " +
            name2 +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "upload to s3 Upload unsuccessful ->" +
            err +
            discordImg
        );
      return res.status(400).json({
        message: "Upload unsuccessful",
        errorMessage: err.message,
        errorCode: err.code,
      });
    } else if (err) {
      console.error(err);
      if (err.code)
        dcerror(
          "/assessment1_image api, customerName: " +
            name1 +
            " " +
            name2 +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "upload to s3 Error occured ->" +
            err.code +
            discordImg
        );
      else
        dcerror(
          "/assessment1_image api, customerName: " +
            name1 +
            " " +
            name2 +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "upload to s3 Error occured ->" +
            err +
            discordImg
        );
      return res.status(500).json({
        message: "Error occured",
        errorMessage: err.message,
      });
    }

    // no upload error, upload successful
    if (sql != "") {
      pool.query(sql, function (err, endresult) {
        if (err) {
          console.error(err);
          if (err.sqlMessage)
            dcerror(
              "/assessment1_image api, customerName: " +
                name1 +
                " " +
                name2 +
                ", phoneNumber: " +
                phone +
                " \nThe IP address is " +
                ip +
                "\n" +
                "MySql error! ->" +
                err.sqlMessage +
                discordImg
            );
          else
            dcerror(
              "/assessment1_image api, customerName: " +
                name1 +
                " " +
                name2 +
                ", phoneNumber: " +
                phone +
                " \nThe IP address is " +
                ip +
                "\n" +
                "MySql error! ->" +
                err +
                discordImg
            );
          return res.status(404).json({
            message: "MySql error!",
            errorMessage: err,
          });
        }
      });
    }

    // google sheet
    try {
      doc = new GoogleSpreadsheet(
        "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
      );

      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      });

      await doc.loadInfo(); // loads document properties and worksheets
      const sheet = doc.sheetsByTitle[leedsheetname];
      const rows = await sheet.getRows();

      rowid = -1;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].id == mysqlid) {
          rowid = i;
          break;
        }
      }

      if (req.files.frontteethclose)
        rows[rowid].image1 = req.files.frontteethclose[0].location;
      if (req.files.frontteethopen)
        rows[rowid].image2 = req.files.frontteethopen[0].location;
      if (req.files.leftside)
        rows[rowid].image3 = req.files.leftside[0].location;
      if (req.files.upperteeth)
        rows[rowid].image4 = req.files.upperteeth[0].location;
      if (req.files.lowerteeth)
        rows[rowid].image5 = req.files.lowerteeth[0].location;
      if (req.files.rightside)
        rows[rowid].image6 = req.files.rightside[0].location;
      rows[rowid].save();
    } catch (err) {
      console.error(err);
      dcerror(
        "/assessment1_image api, customerName: " +
          name1 +
          " " +
          name2 +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "google " +
          leedsheetname +
          " sheet err -> " +
          err +
          discordImg
      );
    }
  });
  res.send("ok");
});

const upload_resume = multer({ dest: "uploads/resume/" });
const cpUpload_resume = upload_resume.single("resume");

app.post("/join-us", (req, res) => {
  cpUpload_resume(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error(err);
      dcerror("/join-us api Upload unsuccessful -> " + err);
      return res.status(400).json({
        message: "Upload unsuccessful",
        errorMessage: err.message,
        errorCode: err.code,
      });
    } else if (err) {
      console.error(err);
      dcerror("/join-us api Error occured -> " + err);
      return res.status(500).json({
        message: "Error occured",
        errorMessage: err.message,
      });
    }

    let { name, email, phone, job, message } = req.body;
    body = `Apply Time: ${formatdate()} \n\nName: ${name} \nEmail: ${email} \nPhone: ${phone} \nJob: ${job} \n`;
    if (message != "" && message) body += `Message: ${message}`;

    if (req.file)
      sendmail_resume_application(
        body,
        req.file.originalname,
        path.join(__dirname + "/../uploads/resume/" + req.file.filename)
      );
    else sendmail_resume_application(body, null, null);

    res.send("ok");
  });
});

app.post("/contact-us", async (req, res) => {
  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();

  let { name, email, phone, message, checkbox, concern } = req.body;

  if (!name || !phone || !concern || name == "" || phone == "" || concern == "")
    return res.status(400).send("Missing Data");

  // remove '=+' in front of the str
  name = checkStr(name);
  email = checkStr(email);
  phone = checkStr(phone);
  message = checkStr(message);

  // string cleaning
  phone = phone.split("+").join("").split("-").join("").split(" ").join("");

  // init varialbles
  sendto = `christan.web@drclearaligners.com`;

  let sheetname = `other`;
  if (concern == "clear aligners") {
    sendto = "zegayee@drclearaligners.com";
    sheetname = "clear_aligners";
  } else if (concern == "dental treatment") {
    sendto = "clinic@drclearaligners.com";
    sheetname = "dental_treatment";
  } else if (concern == "kol") {
    sendto = "marketing@drclearaligners.com";
    sheetname = "kol_collab";
  } else if (concern == "partner") {
    sendto = "engwee@drclearaligners.com";
    sheetname = "partner";
  } else if (concern == "other") {
    sheetname = "other";
  } else {
    console.error("contact us else not sure condition error");
    sheetname = "error";
  }

  let LeadsData = { TabName: sheetname, ...req.body };

  // save to leads.log
  leads_save("/contact-us", LeadsData);

  // init google sheet
  doc_contact_us = new GoogleSpreadsheet(
    "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
  ); // de spread sheet

  try {
    await doc_contact_us.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc_contact_us.loadInfo(); // loads document properties and worksheets
  } catch (err) {
    console.error(err);
    dcerror(
      "/contac-us api, customerName: " +
        name +
        ", phoneNumber: " +
        phone +
        " \nThe IP address is " +
        ip +
        "\n" +
        "Server Error -> " +
        err
    );
    return res.status(400).send("Server Error");
  }

  // update to sheet
  if (sheetname != "error") {
    try {
      const sheet = doc_contact_us.sheetsByTitle[sheetname];
      const larryRow = await sheet.addRow({
        date: formatdate(),
        name,
        email,
        phone,
        message,
      });
    } catch (err) {
      console.error(err);
      dcerror(
        "/contact-us api, customerName: " +
          name +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "google " +
          sheetname +
          " sheet error -> " +
          err
      );
    }
  }

  //sent data when click checkbox
  if (checkbox == "yes") {
    let doc_contact_us = new GoogleSpreadsheet(
      "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
    ); // new spread sheet
    try {
      await doc_contact_us.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      });
      await doc_contact_us.loadInfo(); // loads document properties and worksheets
    } catch (err) {
      console.error(err);
      dcerror(
        "/contact-us api, customerName: " +
          name +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "Server Error -> " +
          err
      );
      return res.status(400).send("Server Error");
    }

    let sheetname = `accept`;
    try {
      const sheet = doc_contact_us.sheetsByTitle[sheetname];
      const larryRow = await sheet.addRow({
        date: formatdate(),
        name,
        email,
        phone,
        // message
      });
    } catch (err) {
      console.error(err);
      dcerror(
        "/contact-us api, customerName: " +
          name +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "google " +
          sheetname +
          " sheet error -> " +
          err
      );
    }
  }

  res.send("ok");

  // email notify person in charge
  body =
    formatdate() +
    `\n\nName: ${name} \nEmail: ${email} \nPhone: ${phone} \nConcern: ${concern} \nMessage: \n${message}`;

  // sendmail~
  // sendmail(sendto, 'Web DE Contact Us Form', body);
});

app.post("/partner-apply", async (req, res) => {
  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();

  let {
    fullname,
    clinic_name,
    email,
    contact_name,
    speciallty,
    preferred_contact_method,
    state,
    area,
    select_1,
    select_2,
    tell_us,
    number_year,
  } = req.body;

  // save to leads.log
  leads_save("/partner-apply", req.body);

  if (
    !fullname ||
    !clinic_name ||
    !email ||
    !contact_name ||
    !speciallty ||
    !preferred_contact_method ||
    !state ||
    !area ||
    !select_1 ||
    !select_2 ||
    !tell_us ||
    !number_year
  ) {
    dcerror(
      "/partner-apply api, customerName: " +
        fullname +
        ", contactName: " +
        contact_name +
        " \nThe IP address is " +
        ip +
        "\n" +
        "Missing Data"
    );
    return res.status(400).send("Missing Data");
  }

  // remove '=+' in front of the str
  fullname = checkStr(fullname);
  clinic_name = checkStr(clinic_name);
  email = checkStr(email);
  contact_name = checkStr(contact_name);
  state = checkStr(state);
  area = checkStr(area);
  tell_us = checkStr(tell_us);
  number_year = checkStr(number_year);

  // 2.send email notify
  sendto =
    "fatin@drclearaligners.com, chris.tham@drclearaligners.com, engwee@drclearaligners.com";
  body =
    formatdate() +
    `
    Name: ${fullname}
    Clinic Name: ${clinic_name} 
    Email: ${email}
    Contact Name: ${contact_name} 
    Speciallty: ${speciallty}
    Preferred Contact Method: ${preferred_contact_method}
    State: ${state}
    Area: ${area}
    Do you have any experience in prescribing clear aligners?: ${select_1}
    If Yes, how many years have you been in prescribing clear aligners?:${number_year} year
    if No, are you open to prescribing clear aligners for your patients in future?: ${select_2}
    if No, can you tell us why?: ${tell_us}`;

  //send mail~
  // sendmail(sendto, 'Partner Apply Form', body);

  //3. save to db
  sql = `insert into partner_apply (

        name,
        clinic_name,
        email,
        contact_name,
        speciallty ,
        preferred_contact_method,
        state,
        area,
        select_1,
        select_2,
        year_experience,
        tell_us_why
        )values (?)`;

  insertData = [
    fullname,
    clinic_name,
    email,
    contact_name,
    speciallty,
    preferred_contact_method,
    state,
    area,
    select_1,
    select_2,
    number_year,
    tell_us,
  ];
  pool.query(sql, [insertData], function (err, endresult) {
    if (err) {
      console.error(err);
      if (err.sqlMessage)
        dcerror(
          "/partner-apply api, customerName: " +
            fullname +
            ", contactName: " +
            contact_name +
            " \nThe IP address is " +
            ip +
            "\n" +
            "MySql error! -> " +
            err.sqlMessage
        );
      else
        dcerror(
          "/partner-apply api, customerName: " +
            fullname +
            ", contactName: " +
            contact_name +
            " \nThe IP address is " +
            ip +
            "\n" +
            "MySql error! -> " +
            err
        );
      return res.status(404).send("MySql error!");
    }
    req.session.mysqlid = endresult.insertId;
  });

  const name = fullname;
  const clinic = clinic_name;
  const phone = contact_name;
  const method = preferred_contact_method;
  const message = tell_us;
  const year = number_year;

  // add to google sheet
  try {
    doc_contact_us = new GoogleSpreadsheet(
      "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
    );
    await doc_contact_us.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc_contact_us.loadInfo(); // loads document properties and worksheets
    const sheet = doc_contact_us.sheetsByTitle["partner-apply"];
    const larryRow = await sheet.addRow({
      date: formatdate(),
      name,
      clinic,
      email,
      phone,
      speciallty,
      method,
      state,
      area,
      select_1,
      select_2,
      year,
      message,
    });
  } catch (err) {
    console.error(err);
    dcerror(
      "/partner-apply api, customerName: " +
        fullname +
        ", contactName: " +
        contact_name +
        " \nThe IP address is " +
        ip +
        "\n" +
        "google partner-apply sheet error -> " +
        err
    );
  }

  res.send("ok");
});

app.post("/doctors-partnership", async (req, res) => {
  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();

  let {
    firstname,
    lastname,
    email,
    country,
    city,
    clinicname,
    phone,
    language,
    doctorname,
  } = req.body;

  // remove '=+' in front of the str
  firstname = checkStr(firstname);
  lastname = checkStr(lastname);
  email = checkStr(email);
  city = checkStr(city);
  clinicname = checkStr(clinicname);
  phone = checkStr(phone);
  language = checkStr(language);
  doctorname = checkStr(doctorname);

  // save to leads.log
  leads_save("/doctors-partnership", req.body);

  // add to google sheet
  try {
    doc_contact_us = new GoogleSpreadsheet(
      "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
    );
    await doc_contact_us.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc_contact_us.loadInfo(); // loads document properties and worksheets
    const sheet = doc_contact_us.sheetsByTitle["doctors-partnership"];
    const larryRow = await sheet.addRow({
      date: formatdate(),
      firstname,
      lastname,
      email,
      language,
      city,
      clinicname,
      phone,
      doctorname,
    });
  } catch (err) {
    console.error(err);
    dcerror(
      "/doctors-partnership api, customerName: " +
        firstname +
        " " +
        lastname +
        ", phoneNumber: " +
        phone +
        " \nThe IP address is " +
        ip +
        "\n" +
        "google doctors-partnership sheet error -> " +
        err
    );
  }

  res.send("ok");

  // 2.send email notify
  sendto = "kevin@drclearaligners.com";
  body = `
    Date: ${formatdate()}
    First Name: ${firstname}
    Last Name: ${lastname}
    Phone: ${phone}
    Doctor Name: ${doctorname}
    Clinic Name: ${clinicname} 
    Email: ${email}
    Language: ${language}
    City: ${city}
    Country: DE
    `;

  //send mail~
  sendmail(sendto, "Doctors Partnership Form DE", body);
});

app.post("/referral/:kol?", async (req, res) => {
  let { firstname, lastname, phone, checkbox } = req.body;

  ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .split(",")[0]
    .trim();

  // save to leads.log
  leads_save("/referral", req.body);

  let kol = req.session.kol;
  if (!kol) kol = "-";

  if (
    !firstname ||
    !lastname ||
    !phone ||
    !checkbox ||
    firstname == "" ||
    lastname == "" ||
    phone == "" ||
    checkbox == ""
  )
    return res.status(400).send("Missing Data");

  // remove '=+' in front of the str
  firstname = checkStr(firstname);
  lastname = checkStr(lastname);
  phone = checkStr(phone);
  kol = checkStr(kol);

  //3. save to db
  sql = `insert into referral (
        firstname, 
        lastname,
        phone,
        kolname
        )values (?)`;

  insertData = [firstname, lastname, phone, kol];
  pool.query(sql, [insertData], function (err, endresult) {
    if (err) {
      console.error(err);
      if (err.sqlMessage)
        dcerror(
          "/referral api, customerName: " +
            firstname +
            " " +
            lastname +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "mysql error -> " +
            err.sqlMessage
        );
      else
        dcerror(
          "/referral api, customerName: " +
            firstname +
            " " +
            lastname +
            ", phoneNumber: " +
            phone +
            " \nThe IP address is " +
            ip +
            "\n" +
            "mysql error -> " +
            err
        );
      return res.status(404).send("MySql error!");
    }
    req.session.mysqlid = endresult.insertId;

    // fast response
    res.send("ok");
  });

  // init google sheet
  doc_contact_us = new GoogleSpreadsheet(
    "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
  ); // DE google sheet
  let sheetname = `referral`;

  try {
    await doc_contact_us.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc_contact_us.loadInfo(); // loads document properties and worksheets
  } catch (err) {
    console.error(err);
    dcerror(
      "/referral api, customerName: " +
        firstname +
        " " +
        lastname +
        ", phoneNumber: " +
        phone +
        " \nThe IP address is " +
        ip +
        "\n" +
        "Server Error -> " +
        err
    );
    return res.status(400).send("Server Error");
  }
  // update to sheet
  if (sheetname != "error") {
    try {
      const sheet = doc_contact_us.sheetsByTitle[sheetname];
      const larryRow = await sheet.addRow({
        date: formatdate(),
        firstname,
        lastname,
        phone,
        kol,
      });
    } catch (err) {
      console.error(err);
      dcerror(
        "/referral api, customerName: " +
          firstname +
          " " +
          lastname +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "google referral sheet error -> " +
          err
      );
    }
  }

  //sent data when click checkbox
  if (checkbox == "yes") {
    let doc_contact_us = new GoogleSpreadsheet(
      "1sWrt8zfnnR4djaDvYjZwyfR615dwhivJbV4G046HZJw"
    ); // new spread sheet
    try {
      await doc_contact_us.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      });
      await doc_contact_us.loadInfo(); // loads document properties and worksheets
    } catch (err) {
      console.error(err);
      dcerror(
        "/referral api, customerName: " +
          firstname +
          " " +
          lastname +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "Server Error -> " +
          err
      );
      return res.status(400).send("Server Error");
    }

    let sheetname = `accept`;
    try {
      const sheet = doc_contact_us.sheetsByTitle[sheetname];
      const larryRow = await sheet.addRow({
        date: formatdate(),
        firstname,
        lastname,
        phone,
      });
    } catch (err) {
      console.error(err);
      dcerror(
        "/referral api, customerName: " +
          firstname +
          " " +
          lastname +
          ", phoneNumber: " +
          phone +
          " \nThe IP address is " +
          ip +
          "\n" +
          "google " +
          sheetname +
          " sheet err -> " +
          err
      );
    }
  }
});

module.exports = app;
