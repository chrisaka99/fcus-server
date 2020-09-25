const mysql = require("mysql");

var con = mysql.createConnection({
  port: 3306,
  host: "localhost",
  user: "root",
  password: null,
  database: "fcustomer",
});

// con.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected");
// });
con.connect();
module.exports = con;
