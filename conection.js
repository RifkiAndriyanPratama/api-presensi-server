const { Client: PgConnection } = require("pg");

const presensi = new PgConnection({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "presensiDatabase2024!",
  database: "presensi_database",
});

module.exports = presensi;

presensi.connect((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("connected");
  }
});
