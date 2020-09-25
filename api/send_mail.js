require("dotenv").config();

const mailer = require("nodemailer");
// const fs = require("fs");
// const { promisify } = require("util");

const readFile = promisify(fs.readFile);

var transporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

var mailOptions = {
  from: "akachris225@gmail.com",
  to: "kevin.kouadio.1998@gmail.com",
  subject: "Identifiants de connexion",
  html: "aze",
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent " + info.response);
  }
});

sendLoginMail = async (clientMail) => {
  var mailOptions = {
    from: "akachris225@gmail.com",
    to: clientMail,
    subject: "Création de compte Feedback Customer",
    html: await readFile("./email/email.html", "utf-8"),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent " + info.response);
    }
  });
};
