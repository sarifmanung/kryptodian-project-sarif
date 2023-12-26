const nodemailer = require("nodemailer");
const axios = require("axios");
fs = require("fs");
path = require("path");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  service: "gmail",
  auth: {
    user: "donotreply@drclearaligners.com",
    pass: "symcqfufbnzbbnht",
  },
});

function dateformat(n, withtime) {
  if (!n) n = new Date();
  else n = new Date(n);

  y = n.getFullYear();
  m = n.getMonth() + 1;
  d = n.getDate();
  h = n.getHours();
  min = n.getMinutes();
  hour = n.getHours().toString().padStart(2, "0");
  minute = n.getMinutes().toString().padStart(2, "0");

  if (!withtime) {
    //     return d + "/" + m + "/" + y
  }

  return d + "/" + m + "/" + y + " " + hour + ":" + minute;
}

function sendToDiscord(msg) {
  // url = 'http://172.31.45.209:8080/dcerror'; // Production url
  // // url = 'http://13.212.75.76:8080/dcerror'; // Testing url
  // axios.post(url, {
  //         api: '1357y6g5rj', // dcaweb api key
  //         name: 'DCA_WEB_DE',
  //         msg,
  //     })
  //     .then(function(response) {
  //         // console.log(response);
  //     })
  //     .catch(function(error) {
  //         console.error(error);
  //     });
}

exports.formatdate = function (n) {
  return dateformat(n);
};

exports.sendmail = function (email, subject, body) {
  bcc = `406168026@yru.ac.th`;

  const mailOptions = {
    from: "donotreply@drclearaligners.com",
    to: email,
    bcc: bcc,
    subject: subject,
    text: body,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      sendToDiscord("/utils/sendmail api error -> " + error);
    } else {
    }
  });
};

exports.sendmail_resume_application = function (body, filename, source) {
  bcc = `406168026@yru.ac.th`;
  mailOptions = {};

  if (filename) {
    mailOptions = {
      from: "donotreply@drclearaligners.com",
      to: "janice@drclearaligners.com",
      bcc: bcc,
      subject: "Job Application - Web DE",
      text: body,
      attachments: [
        {
          filename: filename,
          path: source,
        },
      ],
    };
  } else {
    mailOptions = {
      from: "donotreply@drclearaligners.com",
      to: "janice@drclearaligners.com",
      bcc: bcc,
      subject: "Job Application - Web DE",
      text: body,
    };
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      sendToDiscord("/utils/sendmail_resume_application api error -> " + error);
    } else {
      fs.unlinkSync(source);
    }
  });
};

// send error message to discord
exports.dcerror = function (msg) {
  sendToDiscord(msg);
};

// save userData to leads.log
exports.leads_save = async function (apiName, userData) {
  let data = await { API: apiName, Date: Date(), ...userData };
  data = JSON.stringify(data) + "\n";

  fs.appendFile("leads.log", data, function (err) {
    if (err) {
      console.error(err);
      sendToDiscord("/utils/leads_save api error -> " + err);
    }
  });
};

// remove =+ in front of the string
exports.checkStr = function (str) {
  str = str + "";
  if (str.substring(0, 2) == "=+") str = str.substring(2);
  return str;
};
