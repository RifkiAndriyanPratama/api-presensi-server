const express = require("express");
const app = express.Router();
const multer = require("multer");
const client = require("../conection");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/", (request, response) => {
  client.query(
    "Select k.id, k.id_jurusan, j.nama_jurusan from master.kelas k join master.jurusan j on k.id_jurusan = j.id",
    (err, result) => {
      if (!err) {
        response.send(result.rows);
      }
    }
  );
});

module.exports = app;
